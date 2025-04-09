import { createServer } from '@/utils';
import { Elysia, t } from 'elysia';
import { NextResponse } from 'next/server';

let supabase: Awaited<ReturnType<typeof createServer>>;

const initSupabase = async () => {
  if (!supabase) {
    try {
      supabase = await createServer();
    } catch (error) {
      throw new Error(`${error instanceof Error ? error.message : 'Unknown error [initSupabase]'}`);
    }
  }
};

const imageUploadSchema = t.Object({
  id: t.Optional(t.String()),
  user_id: t.String(),
  file_name: t.String(),
  file_path: t.String(),
  title: t.Optional(t.String()),
  description: t.Optional(t.String()),
  created_at: t.Optional(t.String()),
});

const imageUploadsApi = new Elysia({ prefix: '/api/image-uploads' })
  .onBeforeHandle(async () => {
    await initSupabase();
  })
  .get('/', async ({ query }) => {
    const { page, limit, sortBy, sortDirection, search } = query;

    let queryBuilder = supabase.from('image_uploads').select('*');

    if (search) {
      queryBuilder = queryBuilder.or(
        `title.ilike.%${search}%,description.ilike.%${search}%,file_name.ilike.%${search}%`,
      );
    }

    if (sortBy && sortDirection) {
      queryBuilder = queryBuilder.order(sortBy, { ascending: sortDirection === 'asc' });
    }

    if (page && limit) {
      const pageNumber = Number.parseInt(page);
      const limitNumber = Number.parseInt(limit);
      const start = (pageNumber - 1) * limitNumber;
      queryBuilder = queryBuilder.range(start, start + limitNumber - 1);
    }

    const { data, error } = await queryBuilder;

    if (error) {
      console.error('[ImageUploadsAPI] Error fetching data:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(data);
  })
  .post(
    '/',
    async ({ body }) => {
      const { data, error } = await supabase.from('image_uploads').insert(body).select().single();

      if (error) {
        console.error('[ImageUploadsAPI] Error inserting data:', error);
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      return NextResponse.json(data);
    },
    {
      body: imageUploadSchema,
    },
  )
  .get(
    '/:id',
    async ({ params: { id } }) => {
      const { data, error } = await supabase
        .from('image_uploads')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('[ImageUploadsAPI] Error fetching data:', error);
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      if (!data) {
        return NextResponse.json({ error: 'Image upload not found' }, { status: 404 });
      }
      return NextResponse.json(data);
    },
    {
      params: t.Object({
        id: t.String(),
      }),
    },
  )
  .put(
    '/:id',
    async ({ params: { id }, body }) => {
      const { data, error } = await supabase
        .from('image_uploads')
        .update(body)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('[ImageUploadsAPI] Error updating data:', error);
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      if (!data) {
        return NextResponse.json({ error: 'Image upload not found' }, { status: 404 });
      }
      return NextResponse.json(data);
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      body: imageUploadSchema,
    },
  )
  .delete(
    '/:id',
    async ({ params: { id } }) => {
      const { data: imageData, error: fetchError } = await supabase
        .from('image_uploads')
        .select('file_path')
        .eq('id', id)
        .single();

      if (fetchError) {
        console.error('[ImageUploadsAPI] Error fetching image data:', fetchError);
        return NextResponse.json({ error: fetchError.message }, { status: 400 });
      }

      if (!imageData || !imageData.file_path) {
        return NextResponse.json({ error: 'Image data or file path not found' }, { status: 404 });
      }

      const { error: storageError } = await supabase.storage
        .from('uploads')
        .remove([imageData.file_path]);

      if (storageError) {
        console.error('[ImageUploadsAPI] Error deleting file from storage:', storageError);
        return NextResponse.json({ error: storageError.message }, { status: 400 });
      }

      const { error: dbError } = await supabase.from('image_uploads').delete().eq('id', id);

      if (dbError) {
        console.error('[ImageUploadsAPI] Error deleting image from database:', dbError);
        return NextResponse.json({ error: dbError.message }, { status: 400 });
      }

      return NextResponse.json({ success: true });
    },
    {
      params: t.Object({
        id: t.String(),
      }),
    },
  )
  .delete(
    '/',
    async ({ body }) => {
      const { data: imageData, error: fetchError } = await supabase
        .from('image_uploads')
        .select('file_path')
        .in('id', body);

      if (fetchError) {
        console.error('[ImageUploadsAPI] Error fetching image data:', fetchError);
        return NextResponse.json({ error: fetchError.message }, { status: 400 });
      }

      if (!imageData || imageData.length === 0) {
        return NextResponse.json({ error: 'Image data or file paths not found' }, { status: 404 });
      }

      const filePaths = imageData.map((image: { file_path: string }) => image.file_path);
      const { error: storageError } = await supabase.storage.from('uploads').remove(filePaths);

      if (storageError) {
        console.error('[ImageUploadsAPI] Error deleting files from storage:', storageError);
        return NextResponse.json({ error: storageError.message }, { status: 400 });
      }

      const { error: dbError } = await supabase.from('image_uploads').delete().in('id', body);

      if (dbError) {
        console.error('[ImageUploadsAPI] Error deleting images from database:', dbError);
        return NextResponse.json({ error: dbError.message }, { status: 400 });
      }

      return NextResponse.json({ success: true });
    },
    {
      body: t.Array(t.String()),
    },
  );

export default imageUploadsApi;
