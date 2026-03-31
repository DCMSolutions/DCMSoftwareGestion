'use server'
 
import { cookies } from 'next/headers'
import type { Languages } from '~/translations'
 
export async function setLang(data: Languages) {
  const cookieStore = cookies();
 
  cookieStore.set({
    name: 'lang',
    value: data,
    httpOnly: false,
    path: '/',
  });
}