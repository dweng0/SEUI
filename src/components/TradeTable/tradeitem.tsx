import { Component, createEffect, createSignal } from 'solid-js'
import styles from './tradetable.module.css'
import { Order } from '../../context/interface'
import cancelImageSrc from '../../assets/cross_symbol.png'
import newOderImageSrc from '../../assets/plus_symbol.png'
import warningImageSrc from '../../assets/exclamation.png'
import tickImageSrc from '../../assets/tick.png'
import useTradeSubmitter from '../../hooks/useTradeSubmitter'
import { Side } from '../../context/Trading'
import appstyles from '../../App.module.css'
const { imageicon, loading: loadingStyle } = appstyles

interface OrderItemProps {
    order: Order
}
const OrderRow: Component<OrderItemProps> = ({ order }) => {
    const { submitTrade, loading } = useTradeSubmitter()
    const [repeatImageSrc, setRepeatImageSrce] = createSignal(newOderImageSrc)
    const [repeatImageClass, setRepeatImageClass] = createSignal('')
    const handleRepeatOrder = async (order: Order) => {
        try {
            await submitTrade({
                amount: order.amount,
                pair: order.pair,
                price: order.price,
                side: order.side as Side,
            })
        } catch (e) {
            setRepeatImageSrce(warningImageSrc)
            console.error(e)
        } finally {
            setRepeatImageSrce(tickImageSrc)

            setTimeout(() => {
                setRepeatImageSrce(newOderImageSrc)
                setRepeatImageClass(imageicon)
            }, 3000)
        }
    }

    createEffect(() => {
        if (loading()) {
            setRepeatImageClass(`${loadingStyle} ${imageicon}`)
        } else {
            setRepeatImageClass(imageicon)
        }
    })

    return (
        <li class={styles.orderrow}>
            <div class={styles.orderrowsubitem}>
                <h3>
                    {order.pair} - {order.side}:{order.price}
                </h3>
                <div class={styles.subtitle}>
                    #{order.order_id} -{' '}
                    {new Date(order.timestamp).toLocaleString()}{' '}
                </div>
                <div>
                    <span class={styles.bookside}>{order.side}</span>• Amount:{' '}
                    {order.amount} • Remaining: {order.remain}
                </div>
            </div>
            <div class={styles.rowbuttons}>
                {order.status === 'open' && (
                    <a class={styles.rowbutton}>
                        <img
                            title="cancel order"
                            class={imageicon}
                            src={cancelImageSrc}
                            alt="cancel open order"
                        />
                    </a>
                )}
                <a
                    class={styles.rowbutton}
                    onClick={() => handleRepeatOrder(order)}
                >
                    <img
                        title="Repeat order"
                        class={repeatImageClass()}
                        src={repeatImageSrc()}
                        alt="repeat order"
                    />
                </a>
            </div>
        </li>
    )
}

export default OrderRow
