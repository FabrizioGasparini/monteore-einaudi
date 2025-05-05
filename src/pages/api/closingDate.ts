import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const handle = async (req: NextApiRequest, res: NextApiResponse) => {
    const session = await getSession({ req });
    if (!session) return res.status(400).json({ message: "Autenticazione richiesta!" });

    const email = session.user?.email as string;

    if (req.method == "GET") {
        const found = await prisma.adminList.findFirst({
            where: {
                email,
            },
        });
        if (!found) return res.status(403).json({ message: "Non hai i permessi per visualizzare la data di chiusura delle iscrizioni!" });

        const closingDateInfo = await prisma.info.findFirst({
            where: {
                tipo: "data",
            },
        });
        if (!closingDateInfo) return res.status(400).json({ message: "Data di chiusura non trovata" });

        const closingTimeInfo = await prisma.info.findFirst({
            where: {
                tipo: "orario",
            },
        });
        if (!closingTimeInfo) return res.status(400).json({ message: "Orario di chiusura non trovato" });

        return res.status(200).json({ date: closingDateInfo.valore, time: closingTimeInfo.valore });
    }

    if (req.method !== "PUT") return res.status(400).json({ message: "Metodo non valido" });

    const { date, time } = req.body;

    if (!date) return res.status(400).json({ message: "Data non valida" });
    if (!time) return res.status(400).json({ message: "Orario non valido" });

    const found = await prisma.adminList.findFirst({
        where: {
            email,
        },
    });
    if (!found) return res.status(403).json({ message: "Non hai i permessi per modificare la data di chiusura delle iscrizioni!" });

    // controlli sulla data di chiusura e sull'orario
    const closingDate = new Date(date + "T" + time);
    const currentDate = new Date();

    if (closingDate.getTime() < currentDate.getTime()) return res.status(400).json({ message: "La data di chiusura deve essere successiva alla data attuale" });

    // Aggiorna la data di chiusura delle iscrizioni (la data si trova nella tabella Info nella riga con parametro "tipo" = "data" e orario nella riga con parametro "tipo" = "orario")
    const closingDateInfo = await prisma.info.findFirst({
        where: {
            tipo: "data",
        },
    });
    if (!closingDateInfo) return res.status(400).json({ message: "Data di chiusura non trovata" });

    await prisma.info.update({
        where: {
            tipo: "data",
        },
        data: {
            valore: date,
        },
    });

    const closingTimeInfo = await prisma.info.findFirst({
        where: {
            tipo: "orario",
        },
    });
    if (!closingTimeInfo) return res.status(400).json({ message: "Orario di chiusura non trovato" });

    await prisma.info.update({
        where: {
            tipo: "orario",
        },
        data: {
            valore: time,
        },
    });

    return res.status(200).json({ message: "Data chiusura aggiornata con successo!", date, time });
};

export default handle;
