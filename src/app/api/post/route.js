import {supabase} from '@/lib/supabase';

export async function GET() {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false });

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
  return new Response(JSON.stringify(data), { status: 200 });
}

export async function POST(request) {
  const body = await request.json();
  const {data, error} = await supabase
    .from('posts')
    .insert([
       body
    ]);
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  };
  return Response.json(data[0])
}