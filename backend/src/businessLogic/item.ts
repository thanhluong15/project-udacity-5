import { parseUserId } from '../auth/utils';
import { ItemAccess } from '../dataLayer/itemsAcess'
import { AttachmentUtils } from '../helpers/attachmentUtils';
import { Item } from '../models/Item'
import { CreateItemRequest } from '../requests/CreateItemRequest'
import { UpdateItemRequest } from '../requests/UpdateItemRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'


const itemAccess = new ItemAccess()
const logger = createLogger('ItemAccess')
const attUtils = new AttachmentUtils()

// Get Item
export async function getItems(jwtToken: string): Promise<Item[]> {
    const userId = parseUserId(jwtToken)
    return itemAccess.getItems(userId)
}

// Create 
export const createItem = async (
    createRequest: CreateItemRequest,
    userId: string
): Promise<Item> => {
    logger.info('Create item entry')

    const itemId = uuid.v4()
    const createdAt = new Date().toISOString()
    const s3AttachmentUrl = attUtils.getAttachmentUrl(itemId)
    const item: Item = {
        userId,
        itemId: itemId,
        duration: 3,
        createdAt,
        done: false,
        attachmentUrl: s3AttachmentUrl,
        ...createRequest
    }

    return await itemAccess.createItem(item)
}

// Update
export async function updateItem(
    itemId: string,
    userId: string,
    updateRequest: UpdateItemRequest
) {
    return await itemAccess.updateItem(itemId, userId, updateRequest)
}

// Delete 
export async function deleteItem(userId: string, itemId: string): Promise<boolean> {
    return await itemAccess.deleteItem(userId, itemId)
}

// Upload Image
export async function createAttachmentUrl(
    userId: string,
    itemId: string
) {
    logger.info('Create attachment entry')
    itemAccess.updateItemAttachmentUrl(userId, itemId)
    return attUtils.getUploadUrl(itemId)
}

// Search Item
export async function searchItem(searchText: string, userId: string) {
    return await itemAccess.searchItem(searchText, userId)
}