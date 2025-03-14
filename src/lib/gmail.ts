import { db } from './firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { User } from 'firebase/auth';

const GMAIL_CONFIG = {
  clientId: '516439091078-4o68vnqqfcfn48cu16k5oggcc9ep3ed1.apps.googleusercontent.com',
  clientSecret: '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',
  redirect_uri: window.location.origin + '/dashboard',
  scope: [
    'https://www.googleapis.com/auth/gmail.modify',
    'https://www.googleapis.com/auth/gmail.readonly',
    'email',
    'profile'
  ]
};

export interface GmailMessage {
  id: string;
  threadId: string;
  labelIds: string[];
  snippet: string;
  payload: {
    headers: {
      name: string;
      value: string;
    }[];
  };
  internalDate: string;
}

export async function fetchEmails(accessToken: string): Promise<GmailMessage[]> {
  try {
    const response = await fetch(
      'https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=100',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch emails');
    }

    const { messages } = await response.json();
    
    // Fetch full message details for each email
    const emailDetails = await Promise.all(
      messages.map(async (message: { id: string }) => {
        const detailResponse = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${message.id}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        return detailResponse.json();
      })
    );

    return emailDetails;
  } catch (error) {
    console.error('Error fetching emails:', error);
    throw error;
  }
}

export async function deleteEmails(messageIds: string[], accessToken: string) {
  try {
    await Promise.all(
      messageIds.map(id =>
        fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}/trash`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        })
      )
    );
  } catch (error) {
    console.error('Batch delete failed:', error);
    throw error;
  }
}

export async function markAsSpam(messageIds: string[], accessToken: string) {
  try {
    await Promise.all(
      messageIds.map(id =>
        fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}/modify`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            addLabelIds: ['SPAM'],
            removeLabelIds: ['INBOX']
          })
        })
      )
    );
  } catch (error) {
    console.error('Batch spam marking failed:', error);
    throw error;
  }
}

export async function getAuthUrl(state: string) {
  const params = new URLSearchParams({
    client_id: GMAIL_CONFIG.clientId,
    redirect_uri: GMAIL_CONFIG.redirect_uri,
    response_type: 'code',
    access_type: 'offline',
    scope: GMAIL_CONFIG.scope.join(' '),
    prompt: 'consent',
    state
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function setCredentials(code: string, user: User) {
  try {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: GMAIL_CONFIG.clientId,
        client_secret: GMAIL_CONFIG.clientSecret,
        redirect_uri: GMAIL_CONFIG.redirect_uri,
        grant_type: 'authorization_code',
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to exchange code for tokens');
    }

    const tokens = await response.json();
    
    // Store tokens in Firestore
    await setDoc(doc(db, 'gmail_tokens', user.uid), {
      tokens,
      email: user.email,
      updatedAt: new Date().toISOString()
    });
    
    return tokens;
  } catch (error) {
    console.error('Error setting credentials:', error);
    throw error;
  }
}

export async function loadStoredCredentials(user: User) {
  try {
    const tokenDoc = await getDoc(doc(db, 'gmail_tokens', user.uid));
    if (tokenDoc.exists()) {
      const { tokens } = tokenDoc.data();
      
      // Verify the credentials are still valid
      try {
        const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
          headers: {
            'Authorization': `Bearer ${tokens.access_token}`,
          },
        });
        
        if (response.ok) {
          return tokens;
        }
        
        // If token is expired, try to refresh it
        if (response.status === 401 && tokens.refresh_token) {
          const newTokens = await refreshAccessToken(tokens.refresh_token);
          await setDoc(doc(db, 'gmail_tokens', user.uid), {
            tokens: newTokens,
            email: user.email,
            updatedAt: new Date().toISOString()
          });
          return newTokens;
        }
      } catch (error) {
        console.error('Error verifying credentials:', error);
      }
    }
    return null;
  } catch (error) {
    console.error('Error loading stored credentials:', error);
    return null;
  }
}

async function refreshAccessToken(refreshToken: string) {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: GMAIL_CONFIG.clientId,
      client_secret: GMAIL_CONFIG.clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to refresh access token');
  }

  return response.json();
}