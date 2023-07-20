import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { createLogger } from '../../utils/logger'
import { getItems } from '../../businessLogic/item'

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  createLogger('Get Item handler: ' + event)
  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const jwtToken = split[1]
  const result = await getItems(jwtToken)

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({ items: result })
  }
}