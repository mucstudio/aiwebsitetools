'use client'

import { useState, useEffect } from 'react'
import { Save, X, Eye, Code, Image as ImageIcon } from 'lucide-react'
import dynamic from 'next/dynamic'

// Dynamically import Monaco Editor to avoid SSR issues
const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-[500px] border border-gray-300 rounded-lg bg-gray-50">
    <p className="text-gray-500">Loading editor...</p>
  </div>
})

interface Category {
  id: number
  name: string
  slug: string
}

interface ToolEditorProps {
  initialData?: {
    id?: number
    name: string
    description: string
    code: string
    icon: string
    categoryId: number
    sortOrder: number
    skipSecurityCheck: boolean
  }
  categories: Category[]
  onSave: (data: any) => Promise<void>
  onCancel: () => void
  saving?: boolean
}

// Icon categories with emojis (500+ icons)
const iconCategories = {
  '常用工具': ['🔧', '🔨', '⚒️', '🛠️', '⚙️', '🔩', '⛏️', '🪛', '🪚', '🔪', '🗜️', '⚖️', '🔗', '⛓️', '🧰', '🧲', '📏', '📐', '✂️', '📌', '📍', '📎', '🖇️', '🔑', '🗝️', '🔐', '🔒', '🔓', '🔏'],
  '人物表情': ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙', '🥲', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥', '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '🥸', '😎', '🤓', '🧐', '😕', '😟', '🙁', '☹️', '😮', '😯', '😲', '😳', '🥺', '😦', '😧', '😨', '😰', '😥', '😢', '😭', '😱', '😖', '😣', '😞', '😓', '😩', '😫', '🥱', '😤', '😡', '😠', '🤬', '😈', '👿', '💀', '☠️', '💩', '🤡', '👹', '👺', '👻', '👽', '👾', '🤖', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾'],
  '人物动作': ['👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💅', '🤳', '💪', '🦾', '🦿', '🦵', '🦶', '👂', '🦻', '👃', '🧠', '🫀', '🫁', '🦷', '🦴', '👀', '👁️', '👅', '👄', '💋', '🩸'],
  '人物角色': ['👶', '👧', '🧒', '👦', '👩', '🧑', '👨', '👩‍🦱', '🧑‍🦱', '👨‍🦱', '👩‍🦰', '🧑‍🦰', '👨‍🦰', '👱‍♀️', '👱', '👱‍♂️', '👩‍🦳', '🧑‍🦳', '👨‍🦳', '👩‍🦲', '🧑‍🦲', '👨‍🦲', '🧔‍♀️', '🧔', '🧔‍♂️', '👵', '🧓', '👴', '👲', '👳‍♀️', '👳', '👳‍♂️', '🧕', '👮‍♀️', '👮', '👮‍♂️', '👷‍♀️', '👷', '👷‍♂️', '💂‍♀️', '💂', '💂‍♂️', '🕵️‍♀️', '🕵️', '🕵️‍♂️', '👩‍⚕️', '🧑‍⚕️', '👨‍⚕️', '👩‍🌾', '🧑‍🌾', '👨‍🌾', '👩‍🍳', '🧑‍🍳', '👨‍🍳', '👩‍🎓', '🧑‍🎓', '👨‍🎓', '👩‍🎤', '🧑‍🎤', '👨‍🎤', '👩‍🏫', '🧑‍🏫', '👨‍🏫', '👩‍🏭', '🧑‍🏭', '👨‍🏭', '👩‍💻', '🧑‍💻', '👨‍💻', '👩‍💼', '🧑‍💼', '👨‍💼', '👩‍🔧', '🧑‍🔧', '👨‍🔧', '👩‍🔬', '🧑‍🔬', '👨‍🔬', '👩‍🎨', '🧑‍🎨', '👨‍🎨', '👩‍🚒', '🧑‍🚒', '👨‍🚒', '👩‍✈️', '🧑‍✈️', '👨‍✈️', '👩‍🚀', '🧑‍🚀', '👨‍🚀', '👩‍⚖️', '🧑‍⚖️', '👨‍⚖️', '👰‍♀️', '👰', '👰‍♂️', '🤵‍♀️', '🤵', '🤵‍♂️', '👸', '🤴', '🥷', '🦸‍♀️', '🦸', '🦸‍♂️', '🦹‍♀️', '🦹', '🦹‍♂️', '🧙‍♀️', '🧙', '🧙‍♂️', '🧚‍♀️', '🧚', '🧚‍♂️', '🧛‍♀️', '🧛', '🧛‍♂️', '🧜‍♀️', '🧜', '🧜‍♂️', '🧝‍♀️', '🧝', '🧝‍♂️', '🧞‍♀️', '🧞', '🧞‍♂️', '🧟‍♀️', '🧟', '🧟‍♂️', '💆‍♀️', '💆', '💆‍♂️', '💇‍♀️', '💇', '💇‍♂️', '🚶‍♀️', '🚶', '🚶‍♂️', '🧍‍♀️', '🧍', '🧍‍♂️', '🧎‍♀️', '🧎', '🧎‍♂️', '🧑‍🦯', '👨‍🦯', '👩‍🦯', '🧑‍🦼', '👨‍🦼', '👩‍🦼', '🧑‍🦽', '👨‍🦽', '👩‍🦽', '🏃‍♀️', '🏃', '🏃‍♂️', '💃', '🕺', '🕴️', '👯‍♀️', '👯', '👯‍♂️', '🧖‍♀️', '🧖', '🧖‍♂️', '🧗‍♀️', '🧗', '🧗‍♂️', '🤺', '🏇', '⛷️', '🏂', '🏌️‍♀️', '🏌️', '🏌️‍♂️', '🏄‍♀️', '🏄', '🏄‍♂️', '🚣‍♀️', '🚣', '🚣‍♂️', '🏊‍♀️', '🏊', '🏊‍♂️', '⛹️‍♀️', '⛹️', '⛹️‍♂️', '🏋️‍♀️', '🏋️', '🏋️‍♂️', '🚴‍♀️', '🚴', '🚴‍♂️', '🚵‍♀️', '🚵', '🚵‍♂️', '🤸‍♀️', '🤸', '🤸‍♂️', '🤼‍♀️', '🤼', '🤼‍♂️', '🤽‍♀️', '🤽', '🤽‍♂️', '🤾‍♀️', '🤾', '🤾‍♂️', '🤹‍♀️', '🤹', '🤹‍♂️', '🧘‍♀️', '🧘', '🧘‍♂️', '🛀', '🛌', '🧑‍🤝‍🧑', '👭', '👫', '👬', '💏', '👩‍❤️‍💋‍👨', '👨‍❤️‍💋‍👨', '👩‍❤️‍💋‍👩', '💑', '👩‍❤️‍👨', '👨‍❤️‍👨', '👩‍❤️‍👩', '👪', '👨‍👩‍👦', '👨‍👩‍👧', '👨‍👩‍👧‍👦', '👨‍👩‍👦‍👦', '👨‍👩‍👧‍👧', '👨‍👨‍👦', '👨‍👨‍👧', '👨‍👨‍👧‍👦', '👨‍👨‍👦‍👦', '👨‍👨‍👧‍👧', '👩‍👩‍👦', '👩‍👩‍👧', '👩‍👩‍👧‍👦', '👩‍👩‍👦‍👦', '👩‍👩‍👧‍👧', '👨‍👦', '👨‍👦‍👦', '👨‍👧', '👨‍👧‍👦', '👨‍👧‍👧', '👩‍👦', '👩‍👦‍👦', '👩‍👧', '👩‍👧‍👦', '👩‍👧‍👧', '🗣️', '👤', '👥', '🫂'],
  '动物哺乳': ['🐶', '🐕', '🦮', '🐕‍🦺', '🐩', '🐺', '🦊', '🦝', '🐱', '🐈', '🐈‍⬛', '🦁', '🐯', '🐅', '🐆', '🐴', '🐎', '🦄', '🦓', '🦌', '🦬', '🐮', '🐂', '🐃', '🐄', '🐷', '🐖', '🐗', '🐽', '🐏', '🐑', '🐐', '🐪', '🐫', '🦙', '🦒', '🐘', '🦣', '🦏', '🦛', '🐭', '🐁', '🐀', '🐹', '🐰', '🐇', '🐿️', '🦫', '🦔', '🦇', '🐻', '🐻‍❄️', '🐨', '🐼', '🦥', '🦦', '🦨', '🦘', '🦡', '🐾'],
  '动物鸟类': ['🦃', '🐔', '🐓', '🐣', '🐤', '🐥', '🐦', '🐧', '🕊️', '🦅', '🦆', '🦢', '🦉', '🦤', '🪶', '🦩', '🦚', '🦜'],
  '动物爬行': ['🐸', '🐊', '🐢', '🦎', '🐍', '🐲', '🐉', '🦕', '🦖'],
  '动物海洋': ['🐳', '🐋', '🐬', '🦭', '🐟', '🐠', '🐡', '🦈', '🐙', '🐚', '🦀', '🦞', '🦐', '🦑', '🪸', '🦪'],
  '动物昆虫': ['🐌', '🦋', '🐛', '🐜', '🐝', '🪲', '🐞', '🦗', '🪳', '🕷️', '🕸️', '🦂', '🦟', '🪰', '🪱', '🦠'],
  '互联网络': ['🌐', '🌍', '🌎', '🌏', '💻', '🖥️', '📱', '⌨️', '🖱️', '🖲️', '💾', '💿', '📀', '🔗', '⛓️', '📡', '📶', '📳', '📴', '📲', '☎️', '📞', '📟', '📠', '🔌', '🔋', '🌐', '💬', '💭', '🗨️', '🗯️', '💡', '🔦', '🕯️', '📧', '📨', '📩', '📤', '📥', '📮', '📪', '📫', '📬', '📭', '🔍', '🔎', '🔐', '🔒', '🔓', '🔏', '🔑', '🗝️', '🛡️', '🔰', '⚠️', '🚸', '⛔', '🚫', '🚳', '🚭', '🚯', '🚱', '🚷', '📵', '🔞', '☢️', '☣️', '⬆️', '↗️', '➡️', '↘️', '⬇️', '↙️', '⬅️', '↖️', '↕️', '↔️', '↩️', '↪️', '⤴️', '⤵️', '🔃', '🔄', '🔙', '🔚', '🔛', '🔜', '🔝', '🆕', '🆓', '🆙', '🆗', '🆒', '🆖', '🔠', '🔡', '🔤', '🔣', '🔢', '#️⃣', '*️⃣', '0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'],
  '软件编程': ['💻', '🖥️', '⌨️', '🖱️', '🖲️', '💾', '💿', '📀', '🗂️', '📁', '📂', '🗃️', '🗄️', '📋', '📊', '📈', '📉', '🔧', '🔨', '⚙️', '🛠️', '⚒️', '🔩', '⛏️', '🪛', '🪚', '🗜️', '🧰', '🔗', '⛓️', '🧲', '🧪', '🧫', '🔬', '🔭', '📡', '🎛️', '🎚️', '🎙️', '📻', '📺', '📷', '📸', '📹', '🎥', '📽️', '🎞️', '🎬', '🎭', '🎨', '🖼️', '🖌️', '🖍️', '✏️', '✒️', '🖋️', '🖊️', '📝', '📄', '📃', '📑', '🔖', '🏷️', '💼', '📊', '📈', '📉', '🗂️', '📁', '📂', '🗃️', '🗄️', '🗑️', '⚡', '🔥', '💥', '✨', '💫', '⭐', '🌟', '✅', '❌', '⭕', '🔴', '🟠', '🟡', '🟢', '🔵', '🟣', '⚫', '⚪', '🟤', '🔺', '🔻', '🔸', '🔹', '🔶', '🔷', '🔳', '🔲', '▪️', '▫️', '◾', '◽', '◼️', '◻️', '🟥', '🟧', '🟨', '🟩', '🟦', '🟪', '⬛', '⬜', '🟫'],
  '科幻未来': ['🤖', '👾', '👽', '🛸', '🚀', '🛰️', '🌌', '🌠', '🌟', '⭐', '✨', '💫', '🪐', '🌍', '🌎', '🌏', '🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘', '🌙', '🌚', '🌛', '🌜', '🌝', '☄️', '💥', '🔥', '⚡', '✨', '🔮', '🎆', '🎇', '🧬', '🔬', '🔭', '🧪', '🧫', '💉', '🩸', '🦠', '🧠', '🫀', '🫁', '🦴', '🦷', '👁️', '🧿', '🔱', '⚛️', '☢️', '☣️', '⚠️', '🚸', '⛔', '🚫', '🔰', '♻️', '🔱', '📛', '🔅', '🔆', '💠', '🌀', '💤', '💨', '💦', '💧', '💫', '🕳️', '🎯', '🎰', '🎲', '🧩', '🎮', '🕹️', '🎯', '🎪', '🎭', '🎬', '🎤', '🎧', '🎼', '🎹', '🥁', '🎷', '🎺', '🎸', '🎻', '🎲', '♟️', '🎯', '🎳', '🎮', '🎰', '🧩', '🃏', '🀄', '🎴', '🎭', '🎪', '🎨', '🖼️', '🎬', '🎤', '🎧', '🎼', '🎹', '🥁', '🎷', '🎺', '🎸', '🎻'],
  '办公文档': ['📄', '📃', '📑', '📊', '📈', '📉', '📋', '🗃️', '🗄️', '🗑️', '📁', '📂', '🗂️', '🗞️', '📰', '📓', '📔', '📒', '📕', '📗', '📘', '📙', '📚', '📖', '🔖', '🏷️', '💼', '📝', '✏️', '✒️', '🖋️', '🖊️', '🖍️', '🖌️', '📮', '📪', '📫', '📬', '📭', '📦', '📯'],
  '电子设备': ['💻', '🖥️', '⌨️', '🖱️', '🖲️', '💾', '💿', '📀', '📱', '📲', '☎️', '📞', '📟', '📠', '📺', '📻', '📷', '📸', '📹', '🎥', '📽️', '🎞️', '🎙️', '🎚️', '🎛️', '🧭', '⏱️', '⏲️', '⏰', '🕰️', '⌛', '⏳', '📡', '🔋', '🔌', '💡', '🔦', '🕯️', '🪔', '🧯', '🛢️'],
  '金融商业': ['💰', '💵', '💴', '💶', '💷', '💸', '💳', '💎', '⚖️', '🧾', '💹', '📈', '📉', '💱', '💲', '🏦', '🏧', '🏪', '🏬', '🏢', '🏛️', '🏗️', '🏭', '🏚️', '🏘️', '🛒', '🛍️', '🎁', '🎀', '🎊', '🎉'],
  '医疗健康': ['💊', '💉', '🩸', '🩹', '🩺', '🧬', '🦠', '🧪', '🧫', '🔬', '🩻', '🩼', '🦷', '🦴', '🧠', '🫀', '🫁', '👁️', '👂', '👃', '👅', '🦾', '🦿', '🧑‍⚕️', '👨‍⚕️', '👩‍⚕️', '🏥', '⚕️', '🩺'],
  '交通工具': ['🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐', '🛻', '🚚', '🚛', '🚜', '🦯', '🦽', '🦼', '🛴', '🚲', '🛵', '🏍️', '🛺', '🚨', '🚔', '🚍', '🚘', '🚖', '🚡', '🚠', '🚟', '🚃', '🚋', '🚞', '🚝', '🚄', '🚅', '🚈', '🚂', '🚆', '🚇', '🚊', '🚉', '✈️', '🛫', '🛬', '🛩️', '💺', '🚁', '🛰️', '🚀', '🛸', '🚢', '⛵', '🛶', '⛴️', '🛥️', '🚤'],
  '建筑地点': ['🏠', '🏡', '🏘️', '🏚️', '🏗️', '🏭', '🏢', '🏬', '🏣', '🏤', '🏥', '🏦', '🏨', '🏪', '🏫', '🏩', '💒', '🏛️', '⛪', '🕌', '🕍', '🛕', '🕋', '⛩️', '🗼', '🗽', '⛲', '⛺', '🌁', '🌃', '🏙️', '🌄', '🌅', '🌆', '🌇', '🌉', '🎠', '🎡', '🎢', '🎪'],
  '自然天气': ['☀️', '🌤️', '⛅', '🌥️', '☁️', '🌦️', '🌧️', '⛈️', '🌩️', '🌨️', '❄️', '☃️', '⛄', '🌬️', '💨', '🌪️', '🌫️', '🌈', '☔', '⚡', '⭐', '🌟', '✨', '💫', '🌙', '🌛', '🌜', '🌚', '🌝', '🌞', '🪐', '🌍', '🌎', '🌏', '🌐', '🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘'],
  '植物花卉': ['🌱', '🌿', '☘️', '🍀', '🎍', '🎋', '🍃', '🍂', '🍁', '🌾', '🌺', '🌻', '🌹', '🥀', '🌷', '🌼', '🌸', '💐', '🏵️', '🌲', '🌳', '🌴', '🌵', '🌾', '🌿', '🎄', '🎋', '🎍'],
  '食物饮料': ['🍎', '🍏', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌶️', '🫑', '🌽', '🥕', '🫒', '🧄', '🧅', '🥔', '🍠', '🥐', '🥯', '🍞', '🥖', '🥨', '🧀', '🥚', '🍳', '🧈', '🥞', '🧇', '🥓', '🥩', '🍗', '🍖', '🦴', '🌭', '🍔', '🍟', '🍕', '🫓', '🥪', '🥙', '🧆', '🌮', '🌯', '🫔', '🥗', '🥘', '🫕', '🥫', '🍝', '🍜', '🍲', '🍛', '🍣', '🍱', '🥟', '🦪', '🍤', '🍙', '🍚', '🍘', '🍥', '🥠', '🥮', '🍢', '🍡', '🍧', '🍨', '🍦', '🥧', '🧁', '🍰', '🎂', '🍮', '🍭', '🍬', '🍫', '🍿', '🍩', '🍪', '🌰', '🥜', '🫘', '🍯', '🥛', '🍼', '🫖', '☕', '🍵', '🧃', '🥤', '🧋', '🍶', '🍺', '🍻', '🥂', '🍷', '🥃', '🍸', '🍹', '🧉', '🍾', '🧊'],
  '运动活动': ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🪀', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🪃', '🥅', '⛳', '🪁', '🏹', '🎣', '🤿', '🥊', '🥋', '🎽', '🛹', '🛼', '🛷', '⛸️', '🥌', '🎿', '⛷️', '🏂', '🪂', '🏋️', '🤼', '🤸', '🤺', '⛹️', '🤾', '🏌️', '🏇', '🧘', '🏊', '🤽', '🚣', '🧗', '🚵', '🚴', '🏆', '🥇', '🥈', '🥉', '🏅', '🎖️', '🎗️'],
  '艺术娱乐': ['🎨', '🖼️', '🖌️', '🖍️', '🎭', '🎪', '🎬', '🎤', '🎧', '🎼', '🎹', '🥁', '🪘', '🎷', '🎺', '🪗', '🎸', '🪕', '🎻', '🎲', '♟️', '🎯', '🎳', '🎮', '🎰', '🧩', '🪀', '🪁', '🎏', '🎐', '🧸', '🪆', '🃏', '🀄', '🎴', '🎊', '🎉', '🎈', '🎀', '🎁', '🎇', '🎆', '🧨', '🪄'],
  '符号标记': ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉️', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐', '⛎', '♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓', '🆔', '⚛️', '🉑', '☢️', '☣️', '📴', '📳', '🈶', '🈚', '🈸', '🈺', '🈷️', '✴️', '🆚', '💮', '🉐', '㊙️', '㊗️', '🈴', '🈵', '🈹', '🈲', '🅰️', '🅱️', '🆎', '🆑', '🅾️', '🆘', '❌', '⭕', '🛑', '⛔', '📛', '🚫', '💯', '💢', '♨️', '🚷', '🚯', '🚳', '🚱', '🔞', '📵', '🚭', '❗', '❕', '❓', '❔', '‼️', '⁉️', '🔅', '🔆', '〽️', '⚠️', '🚸', '🔱', '⚜️', '🔰', '♻️', '✅', '🈯', '💹', '❇️', '✳️', '❎', '🌐', '💠', 'Ⓜ️', '🌀', '💤', '🏧', '🚾', '♿', '🅿️', '🛗', '🈳', '🈂️', '🛂', '🛃', '🛄', '🛅', '🚹', '🚺', '🚼', '⚧️', '🚻', '🚮', '🎦', '📶', '🈁', '🔣', 'ℹ️', '🔤', '🔡', '🔠', '🆖', '🆗', '🆙', '🆒', '🆕', '🆓', '0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟', '🔢', '#️⃣', '*️⃣', '⏏️', '▶️', '⏸️', '⏯️', '⏹️', '⏺️', '⏭️', '⏮️', '⏩', '⏪', '⏫', '⏬', '◀️', '🔼', '🔽', '➡️', '⬅️', '⬆️', '⬇️', '↗️', '↘️', '↙️', '↖️', '↕️', '↔️', '↪️', '↩️', '⤴️', '⤵️', '🔀', '🔁', '🔂', '🔄', '🔃', '🎵', '🎶', '➕', '➖', '➗', '✖️', '♾️', '💲', '💱', '™️', '©️', '®️', '〰️', '➰', '➿', '🔚', '🔙', '🔛', '🔝', '🔜', '✔️', '☑️', '🔘', '🔴', '🟠', '🟡', '🟢', '🔵', '🟣', '⚫', '⚪', '🟤', '🔺', '🔻', '🔸', '🔹', '🔶', '🔷', '🔳', '🔲', '▪️', '▫️', '◾', '◽', '◼️', '◻️', '🟥', '🟧', '🟨', '🟩', '🟦', '🟪', '⬛', '⬜', '🟫', '🔈', '🔇', '🔉', '🔊', '🔔', '🔕', '📣', '📢', '💬', '💭', '🗯️', '♠️', '♣️', '♥️', '♦️', '🃏', '🎴', '🀄', '🕐', '🕑', '🕒', '🕓', '🕔', '🕕', '🕖', '🕗', '🕘', '🕙', '🕚', '🕛', '🕜', '🕝', '🕞', '🕟', '🕠', '🕡', '🕢', '🕣', '🕤', '🕥', '🕦', '🕧']
}

export default function ToolEditor({ initialData, categories, onSave, onCancel, saving }: ToolEditorProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    code: initialData?.code || '<!DOCTYPE html>\n<html>\n<head>\n  <meta charset="UTF-8">\n  <title>Tool</title>\n  <style>\n    body {\n      font-family: Arial, sans-serif;\n      padding: 20px;\n    }\n  </style>\n</head>\n<body>\n  <h1>My Tool</h1>\n  <script>\n    // Your JavaScript code here\n  </script>\n</body>\n</html>',
    icon: initialData?.icon || '🔧',
    categoryId: initialData?.categoryId || (categories[0]?.id || 0),
    sortOrder: initialData?.sortOrder || 0,
    skipSecurityCheck: initialData?.skipSecurityCheck || false
  })

  const [showPreview, setShowPreview] = useState(false)
  const [showIconPicker, setShowIconPicker] = useState(false)
  const [selectedIconCategory, setSelectedIconCategory] = useState('常用工具')
  const [iconSearchQuery, setIconSearchQuery] = useState('')

  const handleChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!formData.name.trim()) {
      alert('Please enter a tool name')
      return
    }
    if (formData.name.length > 50) {
      alert('Tool name must be 50 characters or less')
      return
    }
    if (formData.description && formData.description.length > 200) {
      alert('Description must be 200 characters or less')
      return
    }
    if (!formData.code.trim()) {
      alert('Please enter tool code')
      return
    }
    if (!formData.categoryId) {
      alert('Please select a category')
      return
    }

    await onSave({
      ...formData,
      id: initialData?.id
    })
  }

  // Filter icons based on search query
  const getFilteredIcons = () => {
    if (!iconSearchQuery.trim()) {
      return iconCategories[selectedIconCategory as keyof typeof iconCategories] || []
    }

    // Search across all categories
    const allIcons: string[] = []
    Object.values(iconCategories).forEach(icons => {
      allIcons.push(...icons)
    })

    // Remove duplicates and return
    return [...new Set(allIcons)]
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tool Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              maxLength={50}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="e.g., JSON Formatter"
              required
            />
            <p className="text-xs text-gray-500 mt-1">{formData.name.length}/50 characters</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <select
              value={formData.categoryId}
              onChange={(e) => handleChange('categoryId', parseInt(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            >
              <option value="">Select a category</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              maxLength={200}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Brief description of what this tool does"
            />
            <p className="text-xs text-gray-500 mt-1">{formData.description.length}/200 characters</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Icon
            </label>
            <div className="flex items-center gap-3">
              <div className="text-4xl">{formData.icon}</div>
              <button
                type="button"
                onClick={() => setShowIconPicker(!showIconPicker)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ImageIcon className="w-4 h-4" />
                Choose Icon
              </button>
              <input
                type="text"
                value={formData.icon}
                onChange={(e) => handleChange('icon', e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Or enter custom emoji"
              />
            </div>

            {/* Icon Picker */}
            {showIconPicker && (
              <div className="mt-4 p-4 border border-gray-300 rounded-lg bg-gray-50 max-h-[600px] overflow-y-auto">
                {/* Search Bar */}
                <div className="mb-4">
                  <input
                    type="text"
                    value={iconSearchQuery}
                    onChange={(e) => setIconSearchQuery(e.target.value)}
                    placeholder="搜索图标... (输入关键词搜索所有图标)"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                {/* Category Tabs */}
                {!iconSearchQuery && (
                  <div className="flex gap-2 mb-4 flex-wrap">
                    {Object.keys(iconCategories).map(category => (
                      <button
                        key={category}
                        type="button"
                        onClick={() => {
                          setSelectedIconCategory(category)
                          setIconSearchQuery('')
                        }}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          selectedIconCategory === category
                            ? 'bg-primary-600 text-white shadow-sm'
                            : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                )}

                {/* Icon Grid */}
                <div className="mb-3">
                  <p className="text-sm text-gray-600">
                    {iconSearchQuery
                      ? `显示所有图标 (${getFilteredIcons().length} 个)`
                      : `${selectedIconCategory} (${getFilteredIcons().length} 个图标)`
                    }
                  </p>
                </div>

                <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 lg:grid-cols-15 gap-2">
                  {getFilteredIcons().map((icon, index) => (
                    <button
                      key={`${icon}-${index}`}
                      type="button"
                      onClick={() => {
                        handleChange('icon', icon)
                        setShowIconPicker(false)
                        setIconSearchQuery('')
                      }}
                      className={`text-2xl p-2 rounded hover:bg-white hover:shadow-md transition-all transform hover:scale-110 ${
                        formData.icon === icon
                          ? 'bg-primary-100 ring-2 ring-primary-500 scale-110 shadow-md'
                          : 'bg-white/50'
                      }`}
                      title={icon}
                    >
                      {icon}
                    </button>
                  ))}
                </div>

                {getFilteredIcons().length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p>未找到匹配的图标</p>
                  </div>
                )}

                {/* Close Button */}
                <div className="mt-4 pt-4 border-t border-gray-300 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setShowIconPicker(false)
                      setIconSearchQuery('')
                    }}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    关闭
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort Order
              </label>
              <input
                type="number"
                value={formData.sortOrder}
                onChange={(e) => handleChange('sortOrder', parseInt(e.target.value) || 0)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="0"
              />
            </div>

            <div className="flex items-end">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.skipSecurityCheck}
                  onChange={(e) => handleChange('skipSecurityCheck', e.target.checked)}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">Skip Security Check</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Code Editor */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Code className="w-5 h-5" />
            Tool Code
          </h3>
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Eye className="w-4 h-4" />
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </button>
        </div>

        <div className="border border-gray-300 rounded-lg overflow-hidden">
          <MonacoEditor
            height="500px"
            language="html"
            value={formData.code}
            onChange={(value) => handleChange('code', value || '')}
            theme="vs-light"
            beforeMount={(monaco) => {
              // Disable storage access to avoid errors
              monaco.editor.EditorOptions.storageService = undefined
            }}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: 'on',
              wordWrap: 'on',
              automaticLayout: true,
              scrollBeyondLastLine: false,
              renderWhitespace: 'selection',
              tabSize: 2
            }}
          />
        </div>

        {/* Preview */}
        {showPreview && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Preview</h4>
            <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
              <iframe
                srcDoc={formData.code}
                className="w-full h-96"
                sandbox="allow-scripts allow-same-origin"
                title="Tool Preview"
              />
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <X className="w-5 h-5" />
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-5 h-5" />
          {saving ? 'Saving...' : initialData?.id ? 'Update Tool' : 'Create Tool'}
        </button>
      </div>
    </form>
  )
}
