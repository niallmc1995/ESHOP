const express = require('express');
const { Order } = require('../models/order');
const { OrderItem } = require('../models/order-item');
const { Product } = require('../models/product');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET); // Load from .env

// GET all orders
router.get(`/`, async(req, res) => {
    try {
        const orderList = await Order.find()
            .populate('user', 'name')
            .sort({ dateOrdered: -1 });

        if (!orderList) {
            return res.status(404).json({ success: false, message: 'No orders found' });
        }

        res.status(200).send(orderList);
    } catch (err) {
        console.error('Error fetching orders:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET order by ID
router.get(`/:id`, async(req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('user', 'name')
            .populate({
                path: 'orderItems',
                populate: {
                    path: 'product',
                    populate: 'category'
                }
            });

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        res.send(order);
    } catch (err) {
        console.error('Error fetching order:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// POST create order
router.post('/', async(req, res) => {
    try {
        const orderItemsIds = await Promise.all(
            req.body.orderItems.map(async(orderitem) => {
                let newOrderItem = new OrderItem({
                    quantity: orderitem.quantity,
                    product: orderitem.product
                });

                newOrderItem = await newOrderItem.save();
                return newOrderItem._id;
            })
        );

        const totalPrices = await Promise.all(
            orderItemsIds.map(async(orderItemId) => {
                const orderItem = await OrderItem.findById(orderItemId).populate('product', 'price');
                return orderItem.product.price * orderItem.quantity;
            })
        );

        const totalPrice = totalPrices.reduce((a, b) => a + b, 0);

        let order = new Order({
            orderItems: orderItemsIds,
            shippingAddress1: req.body.shippingAddress1,
            shippingAddress2: req.body.shippingAddress2,
            city: req.body.city,
            zip: req.body.zip,
            country: req.body.country,
            phone: req.body.phone,
            status: req.body.status,
            totalPrice: totalPrice,
            user: req.body.user
        });

        order = await order.save();

        if (!order) {
            return res.status(400).send('The order cannot be created!');
        }

        res.status(200).send(order);
    } catch (err) {
        console.error('Error creating order:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// POST create Stripe Checkout session
router.post('/create-checkout-session', async(req, res) => {
    try {
        const orderItems = req.body;

        if (!orderItems || !Array.isArray(orderItems)) {
            return res.status(400).send('Invalid order items');
        }

        const lineItems = await Promise.all(
            orderItems.map(async(orderItem) => {
                const product = await Product.findById(orderItem.product);
                return {
                    price_data: {
                        currency: 'eur',
                        product_data: { name: product.name },
                        unit_amount: product.price * 100
                    },
                    quantity: orderItem.quantity
                };
            })
        );

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: 'http://localhost:4200/success',
            cancel_url: 'http://localhost:4200/error'
        });

        res.json({ id: session.id });
    } catch (err) {
        console.error('Error creating checkout session:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// PUT update order status
router.put('/:id', async(req, res) => {
    try {
        const order = await Order.findByIdAndUpdate(
            req.params.id, { status: req.body.status }, { new: true }
        );

        if (!order) {
            return res.status(400).send('The order cannot be updated!');
        }

        res.send(order);
    } catch (err) {
        console.error('Error updating order:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// DELETE order
router.delete('/:id', async(req, res) => {
    try {
        const order = await Order.findByIdAndRemove(req.params.id);
        if (order) {
            await Promise.all(order.orderItems.map(orderItem => OrderItem.findByIdAndRemove(orderItem)));
            return res.status(200).json({ success: true, message: 'The order is deleted!' });
        } else {
            return res.status(404).json({ success: false, message: 'Order not found!' });
        }
    } catch (err) {
        console.error('Error deleting order:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET total sales
router.get('/get/totalsales', async (req, res) => {
    try {
        const totalSales = await Order.aggregate([
            {
                $group: {
                    _id: null,
                    totalsales: { $sum: '$totalPrice' } // no casting needed
                }
            }
        ]);

        const totalsales = totalSales.length > 0 ? totalSales[0].totalsales : 0;
        res.send({ totalsales });
    } catch (err) {
        console.error('❌ Error calculating total sales:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});


// GET order count
router.get(`/get/count`, async (req, res) => {
    try {
        console.log('➡️ GET /orders/get/count called');

        // Confirm Order model is usable
        if (!Order || typeof Order.countDocuments !== 'function') {
            throw new Error('Order model is not defined or broken');
        }

        const orderCount = await Order.countDocuments();
        console.log('✅ Order count:', orderCount);

        res.send({ orderCount });
    } catch (err) {
        console.error('❌ Error in /get/count route:', err.stack);
        res.status(500).json({ success: false, error: err.message });
    }
});


// GET user orders by user ID
router.get(`/get/userorders/:userid`, async(req, res) => {
    try {
        const userOrderList = await Order.find({ user: req.params.userid })
            .populate({
                path: 'orderItems',
                populate: {
                    path: 'product',
                    populate: 'category'
                }
            })
            .sort({ dateOrdered: -1 });

        if (!userOrderList || userOrderList.length === 0) {
            return res.status(404).json({ success: false, message: 'No orders for user' });
        }

        res.send(userOrderList);
    } catch (err) {
        console.error('Error fetching user orders:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;