import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

export async function GET(request: Request, { params }: { params: { key: string } }) {
    const { key } = params;
    try {
        const encodedHtml = await redis.get(key);
        if (!encodedHtml) {
            return NextResponse.json({ error: 'Key not found' }, { status: 404 });
        }

        // Check if encodedHtml is a string
        if (typeof encodedHtml !== 'string') {
            return NextResponse.json({ error: 'Invalid data format' }, { status: 500 });
        }

        const decodedHtml = decodeURIComponent(encodedHtml);

        if (decodedHtml.startsWith('<!DOCTYPE html>')) {
            return new Response(decodedHtml, {
                status: 200,
                headers: {
                    'Content-Type': 'text/html',
                },
            });
        } else {
            // DECODE URI
            const htmlContent = decodedHtml.split('```html')[1].split('```')[0];
            return new Response(htmlContent, {
                status: 200,
                headers: {
                    'Content-Type': 'text/html',
                },
            });
        }
    } catch (error) {
        console.error('Error retrieving data from Upstash:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}