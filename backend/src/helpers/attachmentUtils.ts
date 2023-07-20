import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'

const XAWS = AWSXRay.captureAWS(AWS)

// TODO: Implement the fileStogare logic
const attachmentS3Bucket = process.env.ATTACHMENT_S3_BUCKET
const signedUrlExpiration = process.env.SIGNED_URL_EPIRATION

export class AttachmentUtils {
    constructor(
        private readonly s3 = new XAWS.S3({ signatureVersion: 'v4' }),
        private readonly bucketName = attachmentS3Bucket
    ) { }

    getAttachmentUrl(fileId: string) {
        return `https://${this.bucketName}.s3.amazonaws.com/${fileId}`
    }

    getUploadUrl(fileId: string) {
        const url = this.s3.getSignedUrl('putObject', {
            Bucket: this.bucketName,
            Key: fileId,
            Expires: signedUrlExpiration
        })
        return url as string
    }
}