import { LegalTextPage } from './LegalTextPage'
import { legalPages } from './legalContent'

export const ReturnsPage = () => (
  <LegalTextPage title={legalPages.returns.title} body={legalPages.returns.body} />
)
