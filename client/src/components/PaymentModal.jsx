import React, { useState, useContext } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const PaymentModal = ({ plan, onClose, onSuccess }) => {
  const { user, backendUrl, token, loadCreditsData } = useContext(AppContext)

  const [paymentMethod, setPaymentMethod] = useState('card') // 'card', 'upi', 'netbanking'
  const [step, setStep] = useState('details') // 'details', 'processing', 'otp', 'success'
  const [loading, setLoading] = useState(false)

  // Card details
  const [cardNumber, setCardNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvv, setCvv] = useState('')
  const [cardHolder, setCardHolder] = useState(user?.name || '')

  // UPI details
  const [upiId, setUpiId] = useState('')

  // Netbanking details
  const [selectedBank, setSelectedBank] = useState('HDFC')

  // OTP
  const [otp, setOtp] = useState('123456')

  // Format Card Number (adds spaces every 4 digits)
  const handleCardChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 16)
    const formatted = val.match(/.{1,4}/g)?.join(' ') || val
    setCardNumber(formatted)
  }

  // Format Expiry (MM/YY)
  const handleExpiryChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 4)
    if (val.length >= 3) {
      setExpiry(`${val.slice(0, 2)}/${val.slice(2)}`)
    } else {
      setExpiry(val)
    }
  }

  // Get Card Brand Logo Icon based on first digit
  const getCardBrand = () => {
    const clean = cardNumber.replace(/\s/g, '')
    if (clean.startsWith('4')) return 'VISA'
    if (clean.startsWith('5')) return 'Mastercard'
    if (clean.startsWith('6')) return 'RuPay'
    if (clean.startsWith('3')) return 'Amex'
    return 'Card'
  }

  // Initiate Payment Process
  const handlePay = (e) => {
    e.preventDefault()
    setStep('processing')
    setTimeout(() => {
      setStep('otp')
    }, 1500)
  }

  // Confirm OTP & Add Credits via Backend API
  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data } = await axios.post(
        backendUrl + '/api/user/pay-custom',
        {
          planId: plan.id,
          paymentMethod,
          cardDetails: { cardNumber, cardHolder }
        },
        { headers: { token } }
      )

      if (data.success) {
        setStep('success')
        await loadCreditsData()
        toast.success(data.message || 'Payment Successful!')
        setTimeout(() => {
          onSuccess && onSuccess()
          onClose()
        }, 2200)
      } else {
        toast.error(data.message || 'Payment failed')
        setStep('details')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Payment failed')
      setStep('details')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 backdrop-blur-md bg-slate-900/60 flex justify-center items-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.3 }}
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col md:flex-row my-auto"
      >
        {/* Left Side: Order Summary */}
        <div className="md:w-5/12 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-6 md:p-8 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none"></div>

          <div>
            <div className="flex items-center justify-between mb-6">
              <span className="text-xs font-semibold tracking-wider text-blue-400 uppercase bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                🔒 256-Bit SSL Secure
              </span>
            </div>

            <p className="text-slate-400 text-xs font-medium">Checkout Plan</p>
            <h3 className="text-2xl font-bold text-white mt-1">{plan.id} Plan</h3>
            <p className="text-sm text-slate-300 mt-1">{plan.desc}</p>

            <div className="my-6 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <div className="flex justify-between items-center text-sm mb-2">
                <span className="text-slate-300">Credits Included</span>
                <span className="font-semibold text-blue-300">+{plan.credits} Credits</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-300">Validity</span>
                <span className="text-slate-300">Lifetime</span>
              </div>
              <div className="border-t border-white/10 my-3"></div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-slate-200">Total Amount</span>
                <span className="text-2xl font-extrabold text-white">₹{plan.price}</span>
              </div>
            </div>
          </div>

          <div className="text-xs text-slate-400 flex items-center gap-2">
            <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
            </svg>
            <span>Instant Crediting Guarantee</span>
          </div>
        </div>

        {/* Right Side: Payment Form & Steps */}
        <div className="md:w-7/12 p-6 md:p-8 relative bg-white flex flex-col justify-between">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 p-1.5 rounded-full hover:bg-gray-100 transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <AnimatePresence mode="wait">
            {step === 'details' && (
              <motion.div
                key="details"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5"
              >
                <div>
                  <h4 className="text-lg font-bold text-gray-900">Select Payment Method</h4>
                  <p className="text-xs text-gray-500">All payment options are fully supported</p>
                </div>

                {/* Tabs */}
                <div className="grid grid-cols-3 gap-2 p-1 bg-gray-100 rounded-xl text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                      paymentMethod === 'card' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    <span>💳 Card</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('upi')}
                    className={`py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                      paymentMethod === 'upi' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    <span>📱 UPI / QR</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('netbanking')}
                    className={`py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                      paymentMethod === 'netbanking' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    <span>🏦 Netbank</span>
                  </button>
                </div>

                <form onSubmit={handlePay} className="space-y-4">
                  {/* Card Section */}
                  {paymentMethod === 'card' && (
                    <div className="space-y-3">
                      <div className="relative">
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Card Number</label>
                        <input
                          type="text"
                          required
                          value={cardNumber}
                          onChange={handleCardChange}
                          placeholder="4111 2222 3333 4444"
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm font-mono tracking-wider transition-all"
                        />
                        <span className="absolute right-3 top-8 text-xs font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                          {getCardBrand()}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">Expiry (MM/YY)</label>
                          <input
                            type="text"
                            required
                            value={expiry}
                            onChange={handleExpiryChange}
                            placeholder="12/28"
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm text-center font-mono transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">CVV Security Code</label>
                          <input
                            type="password"
                            required
                            maxLength="4"
                            value={cvv}
                            onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                            placeholder="123"
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm text-center font-mono transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Cardholder Name</label>
                        <input
                          type="text"
                          required
                          value={cardHolder}
                          onChange={(e) => setCardHolder(e.target.value)}
                          placeholder="Name on card"
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm transition-all"
                        />
                      </div>
                    </div>
                  )}

                  {/* UPI Section */}
                  {paymentMethod === 'upi' && (
                    <div className="space-y-4">
                      <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl text-center flex flex-col items-center">
                        <div className="w-32 h-32 bg-white p-2 border rounded-xl shadow-sm mb-2 flex items-center justify-center">
                          {/* Simulated QR Code SVG */}
                          <svg className="w-28 h-28 text-slate-800" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm9-2h8v8h-8V2zm2 2v4h4V4h-4zM2 14h8v8H2v-8zm2 2v4h4v-4H4zm13-2h3v3h-3v-3zm0 5h3v3h-3v-3zm-5-5h3v3h-3v-3zm0 5h3v3h-3v-3z"/>
                          </svg>
                        </div>
                        <p className="text-xs text-gray-500 font-medium">Scan using GPay, PhonePe, Paytm or BHIM</p>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Or Enter Virtual Payment Address (VPA)</label>
                        <input
                          type="text"
                          required
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          placeholder="username@upi / mobile@okaxis"
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm transition-all"
                        />
                      </div>
                    </div>
                  )}

                  {/* Netbanking Section */}
                  {paymentMethod === 'netbanking' && (
                    <div className="space-y-3">
                      <label className="block text-xs font-semibold text-gray-600">Select Bank</label>
                      <div className="grid grid-cols-2 gap-2">
                        {['HDFC Bank', 'SBI Bank', 'ICICI Bank', 'Axis Bank', 'Kotak Mahindra', 'Punjab National'].map((bank) => (
                          <button
                            key={bank}
                            type="button"
                            onClick={() => setSelectedBank(bank)}
                            className={`p-3 rounded-xl border text-xs font-semibold text-left transition-all ${
                              selectedBank === bank
                                ? 'border-blue-600 bg-blue-50/50 text-blue-700 shadow-sm'
                                : 'border-gray-200 hover:border-gray-300 text-gray-700'
                            }`}
                          >
                            🏦 {bank}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 rounded-xl shadow-lg shadow-blue-500/25 transition-all text-sm flex items-center justify-center gap-2"
                  >
                    <span>Pay ₹{plan.price} Now</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>
                </form>
              </motion.div>
            )}

            {/* Processing Step */}
            {step === 'processing' && (
              <motion.div
                key="processing"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="py-12 text-center space-y-4"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 text-blue-600 animate-pulse">
                  <svg className="w-8 h-8 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
                <h4 className="text-xl font-bold text-gray-900">Connecting to Bank Gateway...</h4>
                <p className="text-xs text-gray-500 max-w-xs mx-auto">Please do not refresh or close this window while we secure your payment authorization.</p>
              </motion.div>
            )}

            {/* 2FA OTP Step */}
            {step === 'otp' && (
              <motion.div
                key="otp"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5 my-auto"
              >
                <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg">
                    🔒
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-indigo-950 uppercase tracking-wide">3D Secure Authorization</h5>
                    <p className="text-xs text-indigo-700">Bank authentication code sent to registered mobile</p>
                  </div>
                </div>

                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Enter 6-Digit Verification OTP Code</label>
                    <input
                      type="text"
                      required
                      maxLength="6"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-center font-mono text-xl tracking-widest transition-all"
                    />
                    <p className="text-[11px] text-gray-400 text-center mt-1">Default test code: <span className="font-bold text-gray-700">123456</span></p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl shadow-lg shadow-emerald-500/25 transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {loading ? (
                      <span>Verifying Payment...</span>
                    ) : (
                      <span>Submit OTP & Confirm Payment</span>
                    )}
                  </button>
                </form>
              </motion.div>
            )}

            {/* Success Step */}
            {step === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-8 text-center space-y-4"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mb-2">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h4 className="text-2xl font-bold text-gray-900">Payment Successful!</h4>
                <p className="text-sm font-semibold text-emerald-600">+{plan.credits} Credits added to your account</p>
                <p className="text-xs text-gray-400">Redirecting to home page...</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}

export default PaymentModal
