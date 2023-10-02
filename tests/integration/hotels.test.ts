import app, { init } from "@/app";
import faker from "@faker-js/faker";
import { TicketStatus } from "@prisma/client";
import httpStatus from "http-status";
import * as jwt from "jsonwebtoken";
import supertest from "supertest";
import { createEnrollmentWithAddress, createPayment, createTicket, createTicketTypeRemote, createTicketTypeWithHotel, createUser } from "../factories";
import { createHotel, createRooms } from "../factories/hotels-factory";
import { cleanDb, generateValidToken } from "../helpers";

const server = supertest(app)

beforeAll(async () => {
    await init()
    await cleanDb()
})

beforeEach(async () => {
    await cleanDb()
})

describe("GET /hotels", () => {
    it("Se nenhum token for fornecido, deve retornar 401 (Unauthorized)", async () => {
        const { status } = await server.get("/hotels")
        expect(status).toBe(httpStatus.UNAUTHORIZED)
    })
    it("Se receber token inválido, deve retornar 401 (Unauthorized)", async () => {
        const token = faker.lorem.word()
        const { status } = await server.get("/hotels").set("Authorization", `Bearer ${token}`)
        expect(status).toBe(httpStatus.UNAUTHORIZED)
    })

    it("Se não houver sessão, deve retornar 401 (Unauthorized)", async () => {
        const noSession = await createUser()
        const token = jwt.sign({ userId: noSession.id }, process.env.JWT_SECRET)
        const { status } = await server.get("/hotels").set("Authorization", `Bearer ${token}`)
        expect(status).toBe(httpStatus.UNAUTHORIZED)
    })

    it("Se o ticket não foi pago, é remoto ou não inclui hotel, deve retornar 402", async () => {
        const user = await createUser()
        const token = await generateValidToken(user)
        const enrollment = await createEnrollmentWithAddress(user)
        const ticketType = await createTicketTypeRemote()
        const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID)
        await createPayment(ticket.id, ticketType.price)
        const { status } = await server.get("/hotels").set("Authorization", `Bearer ${token}`)
        expect(status).toBe(httpStatus.PAYMENT_REQUIRED)
    })

    it("Se não existe inscrição, deve retornar 404", async () => {
        const user = await createUser()
        const token = await generateValidToken(user)
        await createTicketTypeRemote()

        const { status } = await server.get("/hotels").set("Authorization", `Bearer ${token}`)
        expect(status).toBe(httpStatus.NOT_FOUND)
    })

    it("Deve retornar 200 e a lista de hotéis", async () => {
        const user = await createUser()
        const token = await generateValidToken(user)
        const enrollment = await createEnrollmentWithAddress(user)
        const ticketType = await createTicketTypeWithHotel()
        await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID)
        const hotel = await createHotel()

        const { status, body } = await server.get("/hotels").set("Authorization", `Bearer ${token}`)

        expect(status).toBe(httpStatus.OK)
        expect(body).toEqual([
            {
                id: hotel.id,
                name: hotel.name,
                image: hotel.image,
                createdAt: hotel.createdAt.toISOString(),
                updatedAt: hotel.updatedAt.toISOString()
            }
        ])
    })
})

describe("GET /hotels/:id", () => {
    it("Se nenhum token for fornecido, deve retornar 401 (Unauthorized)", async () => {
        const { status } = await server.get("/hotels/1")
        expect(status).toBe(httpStatus.UNAUTHORIZED)
    })
    it("Se receber token inválido, deve retornar 401 (Unauthorized)", async () => {
        const token = faker.lorem.word()
        const { status } = await server.get("/hotels/1").set("Authorization", `Bearer ${token}`)
        expect(status).toBe(httpStatus.UNAUTHORIZED)
    })

    it("Se não houver sessão, deve retornar 401 (Unauthorized)", async () => {
        const noSession = await createUser()
        const token = jwt.sign({ userId: noSession.id }, process.env.JWT_SECRET)
        const { status } = await server.get("/hotels/1").set("Authorization", `Bearer ${token}`)
        expect(status).toBe(httpStatus.UNAUTHORIZED)
    })

    it("Se o ticket não foi pago, é remoto ou não inclui hotel, deve retornar 402", async () => {
        const user = await createUser()
        const token = await generateValidToken(user)
        const enrollment = await createEnrollmentWithAddress(user)
        const ticketType = await createTicketTypeRemote()
        const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID)
        const { status } = await server.get("/hotels/1").set("Authorization", `Bearer ${token}`)
        expect(status).toBe(httpStatus.PAYMENT_REQUIRED)
    })

    it("Se não existe inscrição, deve retornar 404", async () => {
        const token = await generateValidToken()
        const { status } = await server.get("/hotels/1").set("Authorization", `Bearer ${token}`)
        expect(status).toBe(httpStatus.NOT_FOUND)
    })

    // it("Se não existe hotel, deve retornar 404", async () => {

    // })

    it("Deve retornar 200 e lista de hotéis com quartos", async () => {
        const user = await createUser()
        const token = await generateValidToken(user)
        const enrollment = await createEnrollmentWithAddress(user)
        const ticketType = await createTicketTypeWithHotel()
        const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID)
        const hotel = await createHotel()
        const room = await createRooms(hotel.id)
        const { status, body } = await server.get(`/hotels/${hotel.id}`).set("Authorization", `Bearer ${token}`)
        expect(status).toBe(httpStatus.OK)
        expect(body).toEqual({
            id: hotel.id,
            name: hotel.name,
            image: hotel.image,
            createdAt: hotel.createdAt.toISOString(),
            updatedAt: hotel.updatedAt.toISOString(),
            Rooms: [{
                id: room.id,
                name: room.name, 
                capacity: room.capacity,
                hotelId: hotel.id,
                createdAt: room.createdAt.toISOString(),
                updatedAt: room.updatedAt.toISOString(),
            }]
        })
    })
})