import type { Appearance } from '@clerk/types'

export const clerkAppearance: Appearance = {
  variables: {
    colorPrimary:        '#7C3AED',
    colorBackground:     '#FFFFFF',
    colorText:           '#0E0B1A',
    colorTextSecondary:  'rgba(14, 11, 26, 0.50)',
    colorInputBackground:'#FFFFFF',
    colorInputText:      '#0E0B1A',
    colorNeutral:        'rgba(14, 11, 26, 0.08)',
    borderRadius:        '12px',
    fontFamily:          'Plus Jakarta Sans, ui-sans-serif, system-ui, sans-serif',
    fontSize:            '14px',
  },
  elements: {
    rootBox:  'w-full',
    card:     'shadow-none border-0 bg-transparent p-0 gap-6 w-full',
    cardBox:  'shadow-none',
    headerTitle:    'text-[22px] font-bold tracking-[-0.02em]',
    headerSubtitle: 'text-[14px] opacity-50',
    socialButtonsBlockButton:
      'border border-[rgba(14,11,26,0.10)] bg-white hover:bg-[#F5F3FF] text-[rgba(14,11,26,0.70)] shadow-none rounded-xl transition-colors',
    socialButtonsBlockButtonText: 'text-[13px] font-medium',
    dividerLine:  'bg-[rgba(14,11,26,0.08)]',
    dividerText:  'text-[rgba(14,11,26,0.35)] text-xs',
    formFieldLabel: 'text-[13px] font-medium text-[rgba(14,11,26,0.70)]',
    formFieldInput:
      'rounded-xl border-[1.5px] border-[rgba(14,11,26,0.10)] bg-white shadow-none h-11 focus:border-[#7C3AED] focus:ring-2 focus:ring-[rgba(124,58,237,0.15)]',
    formButtonPrimary:
      'rounded-full text-[14px] font-semibold shadow-none h-11 normal-case bg-[#7C3AED] text-white hover:bg-[#6D28D9] active:bg-[#5B21B6]',
    footerActionLink:  'text-[#7C3AED] font-semibold hover:text-[#6D28D9]',
    footerActionText:  'text-[rgba(14,11,26,0.50)] text-[13px]',
    identityPreviewText:         'text-[13px]',
    identityPreviewEditButton:   'text-[#7C3AED]',
    formFieldInputShowPasswordButton: 'text-[rgba(14,11,26,0.40)]',
    otpCodeFieldInput: 'border-[rgba(14,11,26,0.10)] rounded-xl',
    alertText: 'text-[13px]',
    formResendCodeLink: 'text-[#7C3AED]',
    footer:      'bg-transparent',
    footerPages: 'bg-transparent',
  },
}
