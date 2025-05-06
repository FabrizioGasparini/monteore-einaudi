import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
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
        CredentialsProvider({
            name: "DevLogin",
            credentials: {
                email: {
                    label: "Email",
                    type: "text",
                },
            },
            async authorize(credentials, req) {
                const email = credentials?.email as string;
                if (!email) return null;

                const user = {
                    email,
                    class: "5X ADMIN",
                    subHours: "[]",
                    admin: true,
                };

                if (!user) return null;

                return user;
            },
        }),
    ],
    callbacks: {
        async signIn({ account, profile }: { account: any; profile: any }) {
            if (account.provider === "google") {
                const userData = await service.users.get({ userKey: profile.email });
                if (!userData.data.orgUnitPath) return false;

                const studenteData = userData.data.orgUnitPath.split("/");
                if (studenteData[1] !== "Studenti") return false;

                const classe = studenteData[2];

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

                const user = await prisma.user.findFirst({
                    where: {
                        email: profile.email,
                    },
                });

                if (!user) {
                    await prisma.user.create({
                        data: {
                            email: profile.email,
                            class: classe,
                            subHours: "[]",
                        },
                    });
                }

                if (!!excluded || !!admin) {
                    //console.log(profile.email + " logged in with Login Exclusion or Admin List");
                    return true;
                }

                const classeNumero = Number(studenteData[2][0]);
                return classeNumero >= 1 && profile.email.endsWith("@einaudicorreggio.it");
            }
            return true;
        },
        async session({ session, token }) {
            if (!session) return session;

            const user = await prisma.user.findFirst({
                where: {
                    email: session.user?.email as string,
                },
            });

            if (user && session?.user) session.user.class = user.class;

            const admin = await prisma.adminList.findFirst({
                where: {
                    email: session.user?.email as string,
                },
            });

            session.user.admin = admin ? true : false;

            return session;
        },
    },
    pages: {
        signIn: "/login",
    },
});
