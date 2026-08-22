import React, { useContext, useState } from 'react'
import { assets, plans } from '../assets/assets'
import { AppContext } from '../context/AppContext'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import logoIconRaw from '../assets/logo_icon.svg?raw'

// Pre-compute base64 data URL so Razorpay popup can load it without a network request
const logoIconDataUrl = 'data:image/svg+xml;base64,' + btoa(logoIconRaw)

// Dynamically load the Razorpay Checkout script
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true)
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

const BuyCredit = () => {
  const { user, setShowLogin, token, backendUrl, loadCreditsData } = useContext(AppContext)
  const [loadingPlan, setLoadingPlan] = useState(null)
  const navigate = useNavigate()

  const handlePurchaseClick = async (plan) => {
    if (!user) return setShowLogin(true)

    setLoadingPlan(plan.id)
    try {
      // 1. Load Razorpay checkout script
      const scriptLoaded = await loadRazorpayScript()
      if (!scriptLoaded) {
        toast.error('Failed to load payment gateway. Check your internet connection.')
        return
      }

      // 2. Create a Razorpay Order on the backend
      const { data } = await axios.post(
        backendUrl + '/api/user/pay-razor',
        { planId: plan.id },
        { headers: { token } }
      )

      if (!data.success) {
        toast.error(data.message || 'Could not initiate payment')
        return
      }

      const { order } = data

      // 3. Open Razorpay Checkout popup
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'Imagify',
        description: `${plan.id} Plan — ${plan.credits} Credits`,
        image: logoIconDataUrl,
        order_id: order.id,

        // 4. Handler called after successful payment
        handler: async (response) => {
          try {
            const { data: verifyData } = await axios.post(
              backendUrl + '/api/user/verify-razor',
              {
                razorpay_order_id:   response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature:  response.razorpay_signature,
              },
              { headers: { token } }
            )

            if (verifyData.success) {
              await loadCreditsData()
              toast.success(`🎉 ${plan.credits} Credits added to your account!`)
              navigate('/')
            } else {
              toast.error(verifyData.message || 'Payment verification failed')
            }
          } catch (err) {
            toast.error('Verification error: ' + (err.message || 'Unknown error'))
          }
        },

        prefill: {
          name:  user.name,
          email: user.email || '',
        },

        notes: { planId: plan.id },

        theme: { color: '#4F46E5' },

        modal: {
          ondismiss: () => toast.info('Payment cancelled'),
        },
      }

      const razorpay = new window.Razorpay(options)

      razorpay.on('payment.failed', (response) => {
        toast.error('Payment failed: ' + (response.error?.description || 'Unknown error'))
      })

      razorpay.open()

    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Payment error')
    } finally {
      setLoadingPlan(null)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0.2, y: 100 }}
      transition={{ duration: 1 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className='min-h-[80vh] text-center py-14 mb-10'
    >
      <button className='border border-gray-400 px-10 py-2 rounded-full mb-6'>Our Plans</button>
      <h1 className='text-center text-3xl font-medium mb-6 sm:mb-10'>Choose the plans</h1>

      <div className='flex flex-wrap justify-center gap-6 text-left'>
        {plans.map((item, index) => (
          <div
            key={index}
            className='bg-white drop-shadow-sm border rounded-lg py-12 px-8 text-gray-600 hover:scale-105 transition-all duration-500'
          >
            <img width={40} src={assets.logo_icon} alt="" />
            <p className='mt-3 mb-1 font-semibold'>{item.id}</p>
            <p className='text-sm'>{item.desc}</p>
            <p className='mt-6'>
              <span className='text-3xl font-medium'>₹{item.price}</span> / {item.credits} Credits
            </p>
            <button
              onClick={() => handlePurchaseClick(item)}
              disabled={loadingPlan === item.id}
              className='w-full bg-gray-800 hover:bg-black text-white mt-8 text-sm rounded-md py-2.5 min-w-52 transition-all disabled:opacity-60 flex items-center justify-center gap-2'
            >
              {loadingPlan === item.id ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Processing...</span>
                </>
              ) : (
                user ? 'Purchase' : 'Get Started'
              )}
            </button>
          </div>
        ))}
      </div>


    </motion.div>
  )
}

export default BuyCredit