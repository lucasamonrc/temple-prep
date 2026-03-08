export interface Talk {
  speaker: string;
  title: string;
  conference: string;
  url: string;
  summary: string;
}

export interface Scripture {
  reference: string;
  theme: string;
  url: string;
}

export const GENERAL_CONFERENCE_TALKS: Talk[] = [
  {
    speaker: "President Russell M. Nelson",
    title: "The Temple and Your Spiritual Foundation",
    conference: "October 2021 General Conference",
    url: "https://www.churchofjesuschrist.org/study/general-conference/2021/10/47nelson?lang=eng",
    summary:
      "Temple ordinances and covenants strengthen our spiritual foundation. The safest place to be spiritually is living inside your temple covenants.",
  },
  {
    speaker: "Elder Dale G. Renlund",
    title: "Accessing God's Power through Covenants",
    conference: "April 2023 General Conference",
    url: "https://www.churchofjesuschrist.org/study/general-conference/2023/04/23renlund?lang=eng",
    summary:
      "Covenants connect us to God's power. The covenant path gives us power to overcome the world.",
  },
  {
    speaker: "President Henry B. Eyring",
    title: "All Will Be Well Because of Temple Covenants",
    conference: "April 2024 General Conference",
    url: "https://www.churchofjesuschrist.org/study/general-conference/2024/04/18eyring?lang=eng",
    summary:
      "There is nothing more important than honoring the covenants you have made or may make in the temple.",
  },
  {
    speaker: "President Dallin H. Oaks",
    title: "Covenants and Responsibilities",
    conference: "April 2024 General Conference",
    url: "https://www.churchofjesuschrist.org/study/general-conference/2024/04/47oaks?lang=eng",
    summary:
      "Temple endowment covenants are requirements for exaltation. The temple garment serves as a reminder of sacred commitments.",
  },
  {
    speaker: "President Russell M. Nelson",
    title: "Confidence in the Presence of God",
    conference: "April 2025 General Conference",
    url: "https://www.churchofjesuschrist.org/study/general-conference/2025/04/57nelson?lang=eng",
    summary:
      "Making and keeping temple covenants gives us confidence to approach God. Regular temple worship increases our capacity for virtue and charity.",
  },
];

export const KEY_SCRIPTURES: Scripture[] = [
  {
    reference: "Doctrine & Covenants 97:15\u201317",
    theme: "The Lord's glory rests upon His holy house",
    url: "https://www.churchofjesuschrist.org/study/scriptures/dc-testament/dc/97?lang=eng&id=p15-p17#p15",
  },
  {
    reference: "Doctrine & Covenants 88:119",
    theme: "A house of prayer, fasting, faith, learning, glory, order, and God",
    url: "https://www.churchofjesuschrist.org/study/scriptures/dc-testament/dc/88?lang=eng&id=p119#p119",
  },
  {
    reference: "Doctrine & Covenants 109:22\u201326",
    theme: "The Kirtland Temple dedicatory prayer \u2014 endowment of power",
    url: "https://www.churchofjesuschrist.org/study/scriptures/dc-testament/dc/109?lang=eng&id=p22-p26#p22",
  },
  {
    reference: "Doctrine & Covenants 136:32\u201333",
    theme: "Humility opens us to the Lord's teaching",
    url: "https://www.churchofjesuschrist.org/study/scriptures/dc-testament/dc/136?lang=eng&id=p32-p33#p32",
  },
  {
    reference: "Psalm 24:3\u20135",
    theme: "Who shall ascend into the hill of the Lord?",
    url: "https://www.churchofjesuschrist.org/study/scriptures/ot/ps/24?lang=eng&id=p3-p5#p3",
  },
  {
    reference: "3 Nephi 9:20",
    theme: "A broken heart and a contrite spirit",
    url: "https://www.churchofjesuschrist.org/study/scriptures/bofm/3-ne/9?lang=eng&id=p20#p20",
  },
  {
    reference: "Isaiah 2:2\u20133",
    theme: "The mountain of the Lord's house in the last days",
    url: "https://www.churchofjesuschrist.org/study/scriptures/ot/isa/2?lang=eng&id=p2-p3#p2",
  },
];

export const REFLECTION_QUESTIONS: Record<string, string> = {
  ask_lord: "What questions would I like to ask the Lord in the temple?",
  gratitude: "What would I like to express gratitude to the Lord for?",
  help_needed: "What do I need help with in my life now?",
  power_sought: "What power do I seek from the Lord?",
};

export const TODO_CATEGORIES: Record<string, string> = {
  interviews: "Temple Recommend Interviews",
  scheduling: "Scheduling",
  escort: "Temple Escort",
  clothing: "Temple Clothing",
  travel: "Travel",
  spiritual: "Spiritual Preparation",
};
