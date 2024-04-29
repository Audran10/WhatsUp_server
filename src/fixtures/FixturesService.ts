const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('src/app.module');
const { getModelForClass } = require('@typegoose/typegoose');
const { User, UserSchema } = require('../users/entities/user.entity');
const { Conversation, ConversationSchema } = require('../conversations/entities/conversation.entity');

async function populateDatabase() {
    const app = await NestFactory.createApplicationContext(AppModule);

    try {
        // Récupérer les modèles directement depuis Mongoose
        const userModel = getModelForClass(UserSchema);
        const conversationModel = getModelForClass(ConversationSchema);

        // Supprimer tous les éléments de la base de données
        await Promise.all([
            userModel.deleteMany({}),
            conversationModel.deleteMany({}),
            // Supprimer pour chaque modèle
        ]);

        const data1 = require('./users.json');
        const data2 = require('./conversations.json');
        // Lire pour chaque fichier

        // Remplir la base de données avec les données lues
        await Promise.all([
            userModel.insertMany(data1),
            conversationModel.insertMany(data2),
            // Créer pour chaque modèle
        ]);

        console.log('La base de données a été réinitialisée avec succès.');
    } catch (error) {
        console.error('Une erreur est survenue :', error);
    } finally {
        await app.close();
    }
}

populateDatabase();
