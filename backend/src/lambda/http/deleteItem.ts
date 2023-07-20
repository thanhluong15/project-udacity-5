import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { deleteItem } from '../../businessLogic/item'
import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger'

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  createLogger('Delete Item handler: ' + event)
  const itemId = event.pathParameters.itemId
  const userId = getUserId(event)
  const result = await deleteItem(userId, itemId)

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      result
    })
  }
}
