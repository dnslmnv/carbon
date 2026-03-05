import { LegalTextPage } from './LegalTextPage'
import { legalPages } from './legalContent'

export const PolicyPage = () => (
  <LegalTextPage title={legalPages.policy.title} body={legalPages.policy.body} />
)
