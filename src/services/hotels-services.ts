import { notFoundError } from "@/errors"
import { PaymentRequiredError } from "@/errors/payment-error"
import { enrollmentRepository, ticketsRepository } from "@/repositories"
import hotelsRepository from "@/repositories/hotels-repository"

async function getHotels(userId: number) {
    await handleError(userId)

    const hotels = await hotelsRepository.getHotels()
    return hotels
}

async function getHotelRoom(userId: number, hotelId: number) {
    await handleError(userId)

    const hotel = await hotelsRepository.getHotelRoom(hotelId)
    if (!hotel) {
        throw notFoundError
    }
    return hotel
}

async function handleError(userId: number) {
    const enrollment = await enrollmentRepository.findWithAddressByUserId(userId)
    if (!enrollment) throw notFoundError

    const ticket = await ticketsRepository.findTicketByEnrollmentId(enrollment.id)
    if (!ticket) throw notFoundError()
    if (ticket.status === "RESERVED" || ticket.TicketType.isRemote || !ticket.TicketType.includesHotel) {
        throw PaymentRequiredError()
    }
}

export default { getHotels, getHotelRoom }