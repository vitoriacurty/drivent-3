import { ApplicationError } from "@/protocols";

export function PaymentRequiredError(): ApplicationError {
    return {
        name: 'PaymentRequiredError',
        message: 'You must pay to have access!'
    }
}