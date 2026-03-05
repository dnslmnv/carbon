import { LegalTextPage } from './LegalTextPage'
import { legalPages } from './legalContent'

export const RefundPage = () => (
  <LegalTextPage title={legalPages.refund.title} body={legalPages.refund.body} />
)
