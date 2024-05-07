import 'dotenv/config';
import * as apn from 'apn';

export class ApnsService {
  private apnProvider: apn.Provider;

  constructor() {
    const options: apn.ProviderOptions = {
      token: {
        key: 'AuthKey_P43VR4D7W3.p8',
        keyId: process.env.KEY_ID,
        teamId: process.env.TEAM_ID,
      },
      production: false,
    };

    this.apnProvider = new apn.Provider(options);
  }

  async sendPushNotification(
    devicesToken: string[],
    conversationName: string,
    senderName: string,
    message: string,
  ): Promise<void> {
    const note = new apn.Notification({
      alert: {
        title: conversationName,
        body: `${senderName}: ${message}`,
      },
      sound: 'default',
      topic: 'com.paulvayssier.WhatsUpApp',
    });

    note.expiry = Math.floor(Date.now() / 1000) + 3600;

    try {
      const response = await this.apnProvider.send(note, devicesToken);
      console.log('Notification response:', response);
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }
}
