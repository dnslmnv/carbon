import { LegalTextPage } from './LegalTextPage'
import { legalPages } from './legalContent'

export const OfferPage = () => (
  <LegalTextPage title={legalPages.offer.title} body={legalPages.offer.body} />
)
