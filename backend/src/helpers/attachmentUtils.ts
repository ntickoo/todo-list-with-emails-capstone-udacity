import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'

const XAWS = AWSXRay.captureAWS(AWS)

const bucketName = process.env.ATTACHMENT_S3_BUCKET;
const urlExpiration = Number(process.env.SIGNED_URL_EXPIRATION);

// TODO: Implement the fileStogare logic
const s3 = new XAWS.S3({
    signatureVersion: 'v4'
  })
export function createAttachmentPresignedUrl(imageId: string) {
    return s3.getSignedUrl("putObject", {
      Bucket: bucketName,
      Key: imageId,
      Expires: urlExpiration,
    });
}