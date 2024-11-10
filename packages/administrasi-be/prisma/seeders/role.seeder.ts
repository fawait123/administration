import { PrismaClient } from "@prisma/client"
import { hash } from "../../libs/helpers/encryption.helper"
const prisma = new PrismaClient()

const up = async () => {
    await prisma.role.deleteMany({
        where: {
            name: 'Administrator'
        }
    })
    const role = await prisma.role.create({
        data: {
            name: 'Administrator',
            access: ["Dashboard", "General", "Pengguna", "Role", "Hasil Kerja Anggota", "Pekerja", "Invoice", "Aktifitas", "Perusahaan", "Tambah Hasil Kerja Anggota", "Tambah Invoice", "Laba Rugi", "Pajak"]
        }
    })

    await prisma.user.deleteMany({
        where: {
            username: 'administrator'
        }
    })
    const user = await prisma.user.create({
        data: {
            email: 'administrator@mail.com',
            username: 'administrator',
            password: await hash('123@Password'),
            roleId: role.id
        }
    })

    return { role, user };
}

up()