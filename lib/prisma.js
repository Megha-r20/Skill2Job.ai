import { PrismaClient } from '@prisma/client';

const globalForPrisma = global;
export const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production')
    globalForPrisma.prisma = prisma;

let isOffline = false;
let lastOfflineCheck = 0;
const RETRY_INTERVAL = 30000;

export function isDbOffline() {
    if (!isOffline) return false;
    if (Date.now() - lastOfflineCheck > RETRY_INTERVAL) {
        isOffline = false;
        return false;
    }
    return true;
}

export function setDbOffline() {
    isOffline = true;
    lastOfflineCheck = Date.now();
}
