import { LegalTextPage } from './LegalTextPage'
import { legalPages } from './legalContent'

export const PaymentPage = () => (
  <LegalTextPage title={legalPages.payment.title} body={legalPages.payment.body} />
)
