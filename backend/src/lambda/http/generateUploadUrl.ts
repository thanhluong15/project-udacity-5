import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { getUserId } from '../utils'
import { createAttachmentUrl } from '../../businessLogic/item'
import { createLogger } from '../../utils/logger'

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  createLogger('Generate Item handler: ' + event)
  const itemId = event.pathParameters.itemId
  const userId = getUserId(event)
  const url = await createAttachmentUrl(userId, itemId)

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      uploadUrl: url
    })
  }
}
