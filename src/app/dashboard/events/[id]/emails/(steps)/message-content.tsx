"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Image } from "@tiptap/extension-image";
import { Placeholder } from "@tiptap/extension-placeholder";
import { TextAlign } from "@tiptap/extension-text-align";
import { EditorContent, useEditor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { useAtom } from "jotai";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  ArrowLeft,
  Bold,
  Code2,
  Heading1,
  Heading2,
  Heading3,
  ImageIcon,
  Italic,
  Loader,
  Save,
  TextIcon,
} from "lucide-react";
import { useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { FormContainer } from "@/app/dashboard/(create-event)/form-container";
import { newEventEmailTemplateAtom } from "@/atoms/new-email-template-atom";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { getBase64FromUrl } from "@/lib/utils";

import { createEventEmailTemplate } from "../actions";

/* eslint-disable @typescript-eslint/strict-boolean-expressions */

const EventEmailTemplateContentSchema = z.object({
  name: z.string().nonempty({ message: "Tytuł nie może być pusty." }),
  content: z.string().nonempty({ message: "Treść nie może być pusta." }),
});

function Editor({
  form,
  onChange,
}: {
  form: ReturnType<
    typeof useForm<z.infer<typeof EventEmailTemplateContentSchema>>
  >;
  onChange: (value: string) => void;
}) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: "Napisz wiadomość" }),
      TextAlign.configure({
        types: ["heading", "paragraph", "image"],
      }),
      Image.configure({
        allowBase64: true,
      }),
    ],
    content: form.getValues("content"),
    onUpdate: ({ editor: onUpdateEditor }) => {
      onChange(onUpdateEditor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "pb-4 focus:outline-none cursor-text max-h-[200px] overflow-y-auto leading-relaxed",
      },
      handleKeyDown: (_, event) => {
        if (event.key === "Enter") {
          return false;
        }
      },
    },
  });

  return (
    <div className="min-h-[60px] max-w-[974px] rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm">
      <EditorMenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}

function EditorMenuBar({ editor }: { editor: ReturnType<typeof useEditor> }) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  return (
    <div className="flex gap-2 pb-4">
      <Button
        size="icon"
        variant={editor?.isActive("bold") ? "default" : "ghost"}
        type="button"
        onClick={() => editor?.chain().focus().toggleBold().run()}
        title="Tekst pogrubiony"
      >
        <Bold />
      </Button>
      <Button
        size="icon"
        variant={editor?.isActive("italic") ? "default" : "ghost"}
        type="button"
        onClick={() => editor?.chain().focus().toggleItalic().run()}
        title="Tekst pochyły"
      >
        <Italic />
      </Button>
      <Button
        size="icon"
        variant={editor?.isActive("code") ? "default" : "ghost"}
        type="button"
        onClick={() => editor?.chain().focus().toggleCode().run()}
        title="Kod (czcionka mono)"
      >
        <Code2 />
      </Button>
      <Button
        size="icon"
        variant={
          editor?.isActive("heading", { level: 1 }) ? "default" : "ghost"
        }
        type="button"
        onClick={() =>
          editor?.chain().focus().toggleHeading({ level: 1 }).run()
        }
        title="Nagłówek stopnia pierwszego"
      >
        <Heading1 />
      </Button>
      <Button
        size="icon"
        variant={
          editor?.isActive("heading", { level: 2 }) ? "default" : "ghost"
        }
        type="button"
        onClick={() =>
          editor?.chain().focus().toggleHeading({ level: 2 }).run()
        }
        title="Nagłówek stopnia drugiego"
      >
        <Heading2 />
      </Button>
      <Button
        size="icon"
        variant={
          editor?.isActive("heading", { level: 3 }) ? "default" : "ghost"
        }
        type="button"
        onClick={() =>
          editor?.chain().focus().toggleHeading({ level: 3 }).run()
        }
        title="Nagłówek stopnia trzeciego"
      >
        <Heading3 />
      </Button>
      <Button
        size="icon"
        type="button"
        onClick={() => editor?.chain().focus().setTextAlign("left").run()}
        variant={editor?.isActive({ textAlign: "left" }) ? "default" : "ghost"}
        title="Wyrównanie do lewej"
      >
        <AlignLeft />
      </Button>
      <Button
        size="icon"
        type="button"
        onClick={() => editor?.chain().focus().setTextAlign("center").run()}
        variant={
          editor?.isActive({ textAlign: "center" }) ? "default" : "ghost"
        }
        title="Wyrównanie do środka"
      >
        <AlignCenter />
      </Button>
      <Button
        size="icon"
        type="button"
        onClick={() => editor?.chain().focus().setTextAlign("right").run()}
        variant={editor?.isActive({ textAlign: "right" }) ? "default" : "ghost"}
        title="Wyrównanie w prawo"
      >
        <AlignRight />
      </Button>
      <Button
        size="icon"
        type="button"
        onClick={() => editor?.chain().focus().setTextAlign("justify").run()}
        variant={
          editor?.isActive({ textAlign: "justify" }) ? "default" : "ghost"
        }
        title="Justuj"
      >
        <AlignJustify />
      </Button>
      <input
        type="file"
        className="sr-only"
        ref={fileInputRef}
        onChangeCapture={async (event) => {
          const input = event.target as HTMLInputElement;
          if (input.files?.[0] != null) {
            const newBlobUrl = URL.createObjectURL(input.files[0]);
            const base64 = await getBase64FromUrl(newBlobUrl);
            editor?.chain().focus().setImage({ src: base64 }).run();
            URL.revokeObjectURL(newBlobUrl);
          }
        }}
      />
      <Button
        size="icon"
        type="button"
        onClick={() => fileInputRef.current?.click()}
        variant={editor?.isActive("image") ? "default" : "ghost"}
        title="Wstaw zdjęcie"
      >
        <ImageIcon />
      </Button>
    </div>
  );
}

function MessageContentForm({
  eventId,
  goToPreviousStep,
}: {
  eventId: string;
  goToPreviousStep: () => void;
}) {
  const [newEmailTemplate, setNewEmailTemplate] = useAtom(
    newEventEmailTemplateAtom,
  );

  const { toast } = useToast();

  const form = useForm<z.infer<typeof EventEmailTemplateContentSchema>>({
    resolver: zodResolver(EventEmailTemplateContentSchema),
    defaultValues: {
      name: newEmailTemplate.name,
      content: newEmailTemplate.content,
    },
  });

  const formRef = useRef<HTMLFormElement | null>(null);

  function saveEdits() {
    setNewEmailTemplate((previous) => {
      return { ...previous, ...form.getValues() };
    });
  }

  async function onSubmit(
    values: z.infer<typeof EventEmailTemplateContentSchema>,
  ) {
    const result = await createEventEmailTemplate(eventId, {
      ...newEmailTemplate,
      ...values,
    });

    if (result.success) {
      toast({
        title: "Dodano nowy szablon",
      });

      setNewEmailTemplate({
        content: "",
        name: "",
        trigger: "manual",
        triggerValue: null,
        triggerValue2: null,
      });

      // 'router.refresh()' doesn't work here for some reason - using native method instead
      location.reload();
    } else {
      toast({
        title: "Nie udało się dodać szablonu",
        description: result.error,
        variant: "destructive",
      });
    }
  }

  return (
    <FormContainer
      description="Zawartość wiadomości"
      icon={<TextIcon />}
      step="2/2"
      title="Krok 2"
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          ref={formRef}
          className="space-y-8"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tytuł wiadomości</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="Dziękujemy za rejestrację!"
                    {...field}
                  />
                </FormControl>
                <FormMessage>{form.formState.errors.name?.message}</FormMessage>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Treść wiadomości</FormLabel>
                <Editor form={form} onChange={field.onChange} />
                <FormMessage>{form.formState.errors.name?.message}</FormMessage>
              </FormItem>
            )}
          />
          <div className="flex justify-between">
            <Button
              variant="ghost"
              onClick={() => {
                saveEdits();
                goToPreviousStep();
              }}
              disabled={form.formState.isSubmitting}
            >
              <ArrowLeft /> Wróć
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? (
                <Loader className="animate-spin" />
              ) : (
                <Save />
              )}{" "}
              Zapisz
            </Button>
          </div>
        </form>
      </Form>
    </FormContainer>
  );
}

export { MessageContentForm };
