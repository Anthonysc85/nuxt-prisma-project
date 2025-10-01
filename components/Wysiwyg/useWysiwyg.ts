import { ref, onMounted, onBeforeUnmount, watch } from "vue";

export function useWysiwyg(modelValue: string | undefined, emit: any) {
  const editor = ref<HTMLElement | null>(null);

  const activeStates = ref({
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
    link: false,
    unorderedList: false,
    orderedList: false,
    blockquote: false,
    code: false,
  });

  const currentBlock = ref<null | "blockquote" | "pre">(null);

  function exec(command: string) {
    if (!editor.value) return;
    editor.value.focus();

    if (command === "createLink") {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed) return;

      let url = prompt("Enter the link URL", "https://");
      if (!url) return;
      if (!/^https?:\/\//i.test(url)) url = "http://" + url;

      document.execCommand("createLink", false, url);
    } else {
      document.execCommand(command, false, null);
    }

    updateActiveStates();
    emitChange();
  }

  function toggleBlock(tag: "blockquote" | "pre") {
    if (!editor.value) return;
    editor.value.focus();

    const sel = window.getSelection();
    if (!sel || !sel.rangeCount) return;

    const parentTag = getParentBlockTag(sel.getRangeAt(0).startContainer);

    if (parentTag === tag) {
      document.execCommand("formatBlock", false, "p");
      currentBlock.value = null;
    } else {
      document.execCommand("formatBlock", false, tag);
      currentBlock.value = tag;
    }

    updateActiveStates();
  }

  function getParentBlockTag(node: Node): string | null {
    let el: HTMLElement | null =
      node.nodeType === 3 ? node.parentElement : (node as HTMLElement);
    while (el && el !== editor.value) {
      const tag = el.tagName.toLowerCase();
      if (["p", "pre", "blockquote"].includes(tag)) return tag;
      el = el.parentElement;
    }
    return null;
  }

  function updateActiveStates() {
    activeStates.value.bold = document.queryCommandState("bold");
    activeStates.value.italic = document.queryCommandState("italic");
    activeStates.value.underline = document.queryCommandState("underline");
    activeStates.value.strikethrough =
      document.queryCommandState("strikeThrough");
    activeStates.value.link = document.queryCommandState("createLink");
    activeStates.value.unorderedList = document.queryCommandState(
      "insertUnorderedList"
    );
    activeStates.value.orderedList =
      document.queryCommandState("insertOrderedList");

    if (!editor.value) return;
    const sel = window.getSelection();
    if (!sel || !sel.rangeCount) return;
    const tag = getParentBlockTag(sel.getRangeAt(0).startContainer);

    activeStates.value.blockquote = tag === "blockquote";
    activeStates.value.code = tag === "pre";
  }

  function findClosestPre(node: Node | null): HTMLPreElement | null {
    let el =
      node &&
      (node.nodeType === 3
        ? (node.parentElement as HTMLElement)
        : (node as HTMLElement));
    while (el && el !== editor.value) {
      if (el.tagName && el.tagName.toLowerCase() === "pre")
        return el as HTMLPreElement;
      el = el.parentElement as HTMLElement | null;
    }
    return null;
  }

  function isCaretAtEndOfPre(pre: HTMLElement, range: Range): boolean {
    if (!range.collapsed) return false;
    const r = document.createRange();
    try {
      r.setStart(range.endContainer, range.endOffset);
      r.setEndAfter(pre);
      return r.toString().length === 0;
    } catch (err) {
      return false;
    }
  }

  function handleEditorKeydown(e: KeyboardEvent) {
    if (!editor.value) return;
    if (e.key !== "Enter" || e.shiftKey) return;

    const sel = window.getSelection();
    if (!sel || !sel.rangeCount) return;
    const range = sel.getRangeAt(0);
    const pre = findClosestPre(range.startContainer);

    if (!pre || !sel.isCollapsed) return;

    if (isCaretAtEndOfPre(pre, range)) {
      e.preventDefault();

      const p = document.createElement("p");
      p.innerHTML = "<br>";
      pre.insertAdjacentElement("afterend", p);

      const newRange = document.createRange();
      newRange.setStart(p, 0);
      newRange.collapse(true);
      sel.removeAllRanges();
      sel.addRange(newRange);

      emitChange();
    }
  }

  function handleDocumentClick(e: MouseEvent) {
    if (!editor.value) return;
    const target = e.target as Node;
    if (editor.value.contains(target)) return;

    const pres = editor.value.querySelectorAll("pre");
    if (pres.length) {
      const lastPre = pres[pres.length - 1] as HTMLElement;
      const nextEl = lastPre.nextElementSibling;
      if (!nextEl || nextEl.tagName.toLowerCase() !== "p") {
        const p = document.createElement("p");
        p.innerHTML = "<br>";
        lastPre.insertAdjacentElement("afterend", p);
        emitChange();
      }
    }

    currentBlock.value = null;
    updateActiveStates();
  }

  function handleInput() {
    emitChange();
  }

  function emitChange() {
    if (editor.value) emit("update:modelValue", editor.value.innerHTML);
  }

  onMounted(() => {
    if (editor.value && modelValue) editor.value.innerHTML = modelValue;
    document.addEventListener("selectionchange", updateActiveStates);
    editor.value?.addEventListener("keydown", handleEditorKeydown);
    document.addEventListener("click", handleDocumentClick);
  });

  onBeforeUnmount(() => {
    document.removeEventListener("selectionchange", updateActiveStates);
    editor.value?.removeEventListener("keydown", handleEditorKeydown);
    document.removeEventListener("click", handleDocumentClick);
  });

  watch(
    () => modelValue,
    (val) => {
      if (editor.value && editor.value.innerHTML !== val)
        editor.value.innerHTML = val || "";
    }
  );

  return { editor, activeStates, currentBlock, exec, toggleBlock, handleInput };
}
