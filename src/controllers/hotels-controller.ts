import { AuthenticatedRequest } from "@/middlewares";
import { Response } from "express";
import hotelsServices from "@/services/hotels-services";
import httpStatus from "http-status";

export async function getHotels(req: AuthenticatedRequest, res: Response) {
    const { userId } = req

    try {
        const hotels = await hotelsServices.getHotels(userId)
        return res.status(httpStatus.OK).send(hotels)
    } catch (error) {
        if (error.name === "notFoundError") {
            return res.status(httpStatus.NOT_FOUND)
        }
        return res.status(httpStatus.PAYMENT_REQUIRED)
    }
}

export async function getHotelRoom(req: AuthenticatedRequest, res: Response) {
    const { userId } = req
    const { hotelId } = req.params

    try {
        const hotel = await hotelsServices.getHotelRoom(userId, Number(hotelId))
        return res.send(hotel)
    } catch (error) {
        if (error.name === "notFoundError") {
            return res.status(httpStatus.NOT_FOUND)
        }
        if (error.name === "PaymentRequiredError") {
            return res.status(httpStatus.PAYMENT_REQUIRED)
        }
        return res.status(httpStatus.BAD_REQUEST)
    }
}