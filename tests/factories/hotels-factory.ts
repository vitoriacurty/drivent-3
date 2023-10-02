import { prisma } from "@/config";
import faker from "@faker-js/faker";

export async function createHotel() {
    return prisma.hotel.create({
        data: {
            name: faker.name.findName(),
            image: faker.image.imageUrl(),
        }
    })
}

export async function createRooms(hotelId: number) {
    return prisma.room.create({
        data: {
            hotelId,
            name: faker.datatype.number({ min: 1, max: 100 }).toString(),
            capacity: faker.datatype.number({ min: 1, max: 3 }),
        }
    })
}