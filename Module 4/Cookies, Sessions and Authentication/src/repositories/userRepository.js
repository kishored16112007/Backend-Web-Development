
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function findUserByEmail(email) {
  return prisma.user.findUnique({
    where: { email },
  });
}

async function findUserById(id) {
  return prisma.user.findUnique({
    where: { id },
  });
}

module.exports = {
  findUserByEmail,
  findUserById,
};
