import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

import User from "@models/user";
import { connectToDB } from "@utils/database";

const handler = NextAuth({
    providers: [
        GoogleProvider({
            clientId:
                process.env.GOOGLE_AUTH_ID,
            clientSecret: process.env.GOOGLE_AUTH_SECRET,
        }),
    ],
    callbacks: {
        async session({ session }) {
            try {
           
                const sessionUser = await User.findOne({
                    email: session.user.email,
                });
                if (sessionUser) {
                    session.user.id = sessionUser._id.toString();
                }
                return session;
            } catch (error) {
                console.log("Error finding user in session: ", error.message);
                return session;
            }
        },
        async signIn({ account, profile, user, credentials }) {
            try {
              await connectToDB();
          
              // check if user already exists
              const userExists = await User.findOne({ email: profile.email });
          
              // if not, create a new document and save the user in MongoDB
              if (!userExists) {
                const newUser = await User.create({
                  email: profile.email,
                  username: profile.name.replace(" ", "").toLowerCase(),
                  image: profile.picture,
                });
                return true;
              } else {
                return false; // Indicate that the sign-in attempt failed because the user already exists.
              }
            } catch (error) {
              console.log("Error checking if user exists: ", error.message);
              return false;
            }
          },
          
    },
});

export { handler as GET, handler as POST };
