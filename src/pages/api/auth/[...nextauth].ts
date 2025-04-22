import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { google } from "googleapis";
import { PrismaClient } from "@prisma/client";

const auth = new google.auth.GoogleAuth({
    keyFile: "token.json",
    scopes: ["https://www.googleapis.com/auth/admin.directory.user.readonly"],
    clientOptions: {
        subject: "administrator@einaudicorreggio.it",
    },
});

const service = google.admin({ version: "directory_v1", auth });
const prisma = new PrismaClient();

export default NextAuth({
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            authorization: {
                params: {
                    prompt: "select_account",
                    access_type: "offline",
                    response_type: "code",
                    scope: "openid email profile",
                },
            },
        }),
    ],
    callbacks: {
        async signIn({ account, profile }: { account: any; profile: any }) {
            if (account.provider === "google") {
                const excluded = await prisma.loginExclude.count({
                    where: {
                        email: profile.email,
                    },
                });
                const admin = await prisma.adminList.count({
                    where: {
                        email: profile.email,
                    },
                });
                if (!!excluded || !!admin) {
                    console.log(profile.email + " logged in with Login Exclusion or Admin List");
                    return true;
                }

                const userData = await service.users.get({ userKey: profile.email });
                if (!userData.data.orgUnitPath) return false;

                console.log(userData);

                const studenteData = userData.data.orgUnitPath.split("/");
                if (studenteData[1] !== "Studenti") return false;

                const classeNumero = Number(studenteData[2][0]);
                return classeNumero >= 3 && profile.email.endsWith("@einaudicorreggio.it");
            }
            return true;
        },
    },
    pages: {
        signIn: "/login",
    },
});
