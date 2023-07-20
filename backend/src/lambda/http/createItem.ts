import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { CreateItemRequest } from '../../requests/CreateItemRequest'
import { getUserId } from '../utils';
import { createItem } from '../../businessLogic/item'
import { createLogger } from '../../utils/logger'

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  createLogger('Create Item handler: ' + event)
  const newItem: CreateItemRequest = JSON.parse(event.body)
  const userId = getUserId(event)
  const dataItem = await createItem(newItem, userId)
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': true
  };

  return {
    statusCode: 201,
    headers,
    body: JSON.stringify({
      item: dataItem,
    })
  }
}