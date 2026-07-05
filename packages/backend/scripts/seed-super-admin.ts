import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  const email = process.argv[2] || 'superadmin@gastrocore.com'
  const password = process.argv[3] || 'SuperAdmin123!'
  const name = process.argv[4] || 'Super Admin'

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    console.log(`Super Admin already exists: ${email}`)
    await prisma.$disconnect()
    return
  }

  const passwordHash = await bcrypt.hash(password, 12)

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      name,
      role: 'super_admin',
      isActive: true,
    },
  })

  console.log(`Super Admin created:`)
  console.log(`  Email:    ${email}`)
  console.log(`  Password: ${password}`)
  console.log(`  ID:       ${user.id}`)

  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  prisma.$disconnect()
  process.exit(1)
})
