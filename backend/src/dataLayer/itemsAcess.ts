import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { Item } from '../models/Item'
import { AttachmentUtils } from '../helpers/attachmentUtils'
import { UpdateItemRequest} from '../requests/UpdateItemRequest'

const AWSXRay = require('aws-xray-sdk')
const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('ItemAccess')
const attachment = new AttachmentUtils()

// TODO: Implement the dataLayer logic
export class ItemAccess {
    constructor(
        private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
        private readonly itemsTable = process.env.ITEMS_TABLE,
        private readonly indexName = process.env.INDEX_NAME
    ) { }

    async getAllItems(): Promise<Item[]> {
        const result = await this.docClient.query({
            TableName: this.itemsTable
        }).promise()
        
        const items = result.Items
        logger.info('List Items entry', items)
        return items as Item[]
    }

    // Get Item
    async getItems(userId: string): Promise<Item[]> {
        logger.info('Get Items by id', userId)

        const result = await this.docClient
            .query({
                TableName: this.itemsTable,
                IndexName: this.indexName,
                KeyConditionExpression: 'userId = :userId',
                ExpressionAttributeValues: {
                    ':userId': userId
                }
            })
            .promise()

        const items = result.Items
        //logger.info('Items here: ', items)
        return items as Item[]
    }

    // Create Item Item
    async createItem(item: Item): Promise<Item> {
        logger.info('Creating item entry')
        const result = await this.docClient
            .put({
                TableName: this.itemsTable,
                Item: item
            })
            .promise()
        logger.info('Item created', result)
        return item as Item
    }

    // Update Item
    async updateItem(itemId: string, userId: string, request: UpdateItemRequest) {
        let expressionAttibutes = {
            ":done": request.done,
            ":ItemName": request.ItemName,
            ":startDate": request.startDate
        }
        let updateExpression = "set done = :done, startDate= :startDate, #n= :ItemName"
        logger.info('Update load Items ', itemId)
        await this.docClient.update({
            TableName: this.itemsTable,
            Key: {
                "userId": userId,
                "itemId": itemId
            },
            UpdateExpression: updateExpression,
            ExpressionAttributeValues: expressionAttibutes,
            ExpressionAttributeNames: {
                "#n": "ItemName"
            }
        }).promise()
    }

    // Delete Item
    async deleteItem(userId: string, itemId: string): Promise<boolean> {
        logger.info('Delete Items by id', itemId)
        await this.docClient.delete({
            TableName: this.itemsTable,
            Key: {
                "userId": userId,
                "itemId": itemId
            },
        }).promise()
        return true
    }

    // Upload Image
    async updateItemAttachmentUrl(userId: string, itemId: string) {
        logger.info('Updating item attachment url entry')
        const s3AttachmentUrl = attachment.getAttachmentUrl(itemId)
        const dbItemTable = process.env.ITEMS_TABLE
        const params = {
            TableName: dbItemTable,
            Key: {
                userId,
                itemId: itemId
            },
            UpdateExpression: 'set attachmentUrl = :attachmentUrl',
            ExpressionAttributeValues: {
                ':attachmentUrl': s3AttachmentUrl
            },
            ReturnValues: 'UPDATED_NEW'
        }
        await this.docClient.update(params).promise()
    }

    // Search Item
    async searchItem(searchText: string, userId: string): Promise<Item[]> {
        const params = {
            TableName: this.itemsTable,
            FilterExpression: 'contains(#key, :item_name)',
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeNames: {
                '#key': 'ItemName'
            },
            ExpressionAttributeValues: {
                ':item_name': searchText,
                ':userId': userId
            }
        }
        const data = await this.docClient.query(params).promise()
        return data.Items as Item[]
    }
}