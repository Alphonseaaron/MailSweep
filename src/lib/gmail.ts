import { google } from 'googleapis';
import { db } from './firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const GMAIL_CONFIG = {
  clientId: '516439091078-4o68vnqqfcfn48cu16k5oggcc9ep3ed1.apps.googleusercontent.com',
  clientSecret: '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',
  redirect_uri: window.location.origin + '/dashboard',
  scope: ['https://www.googleapis.com/auth/gmail.modify']
};

const oauth2Client = new google.auth.OAuth2(
  GMAIL_CONFIG.clientId,
  GMAIL_CONFIG.clientSecret,
  GMAIL_CONFIG.redirect_uri
);

export const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

export async function deleteEmails(messageIds: string[]) {
  try {
    const batch = messageIds.map(id => ({
      requestBody: { ids: [id] },
      userId: 'me',
    }));

    await Promise.all(
      batch.map(request => 
        gmail.users.messages.trash(request)
          .catch(error => {
            console.error('Error deleting email:', error);
            throw error;
          })
      )
    );
  } catch (error) {
    console.error('Batch delete failed:', error);
    throw error;
  }
}

export async function markAsSpam(messageIds: string[]) {
  try {
    const batch = messageIds.map(id => ({
      requestBody: { addLabelIds: ['SPAM'], removeLabelIds: ['INBOX'] },
      id,
      userId: 'me',
    }));

    await Promise.all(
      batch.map(request => 
        gmail.users.messages.modify(request)
          .catch(error => {
            console.error('Error marking as spam:', error);
            throw error;
          })
      )
    );
  } catch (error) {
    console.error('Batch spam marking failed:', error);
    throw error;
  }
}

export async function getAuthUrl() {
  try {
    return oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: GMAIL_CONFIG.scope,
      prompt: 'consent',
      state: Math.random().toString(36).substring(7) // Add state parameter for security
    });
  } catch (error) {
    console.error('Error generating auth URL:', error);
    throw error;
  }
}

export async function setCredentials(code: string, userId: string) {
  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    
    // Store tokens in Firestore with error handling
    await setDoc(doc(db, 'gmail_tokens', userId), {
      tokens,
      updatedAt: new Date().toISOString()
    }).catch(error => {
      console.error('Error storing tokens:', error);
      throw error;
    });
    
    return tokens;
  } catch (error) {
    console.error('Error setting credentials:', error);
    throw error;
  }
}

export async function loadStoredCredentials(userId: string) {
  try {
    const tokenDoc = await getDoc(doc(db, 'gmail_tokens', userId));
    if (tokenDoc.exists()) {
      const { tokens } = tokenDoc.data();
      oauth2Client.setCredentials(tokens);
      
      // Verify the credentials are still valid
      try {
        await gmail.users.getProfile({ userId: 'me' });
        return true;
      } catch (error) {
        console.error('Stored credentials are invalid:', error);
        return false;
      }
    }
    return false;
  } catch (error) {
    console.error('Error loading stored credentials:', error);
    return false;
  }
}