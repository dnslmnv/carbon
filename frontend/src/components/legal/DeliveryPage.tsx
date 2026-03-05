import { LegalTextPage } from './LegalTextPage'
import { legalPages } from './legalContent'

export const DeliveryPage = () => (
  <LegalTextPage title={legalPages.delivery.title} body={legalPages.delivery.body} />
)
