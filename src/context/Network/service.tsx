import Big from 'big.js'
import { OrderBook, Quote } from '../interface'

export const fetchQuotes = async (books: OrderBook[], rootAddress: string) => {
    const quotes = await Promise.all(
        books.map(async (book) => {
            const url = `${rootAddress}/orderbooks/${book.pair}/quote`
            const response = await fetch(url)
            if (!response.ok) {
                throw new Error(`Error: ${response.statusText}`)
            }

            const responseData: Quote = await response.json()
            responseData.mid_price = Big(responseData.ask_price)
                .add(responseData.bid_price)
                .div(2)
                .toString()
            return { ...responseData, pair: book.pair }
        })
    )
    return quotes
}
