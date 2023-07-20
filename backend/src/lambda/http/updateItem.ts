import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { updateItem } from '../../businessLogic/item'
import { UpdateItemRequest } from '../../requests/UpdateItemRequest'
import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger'

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  createLogger('Upload Item handler: ' + event)
  const itemId = event.pathParameters.itemId
  const updatedItem: UpdateItemRequest = JSON.parse(event.body)
  const userId = getUserId(event)
  await updateItem(itemId, userId, updatedItem)
  return {
    statusCode: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: ''
  }
}