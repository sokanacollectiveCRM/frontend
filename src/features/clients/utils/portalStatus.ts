import type { User, PortalStatus } from '../data/schema';

/**
 * Gets portal status from lead data.
 * portal_status reflects invitation state: 'not_invited', 'invited', 'active', 'disabled'
 */
export function derivePortalStatus(lead: User): PortalStatus {
  // If portal_status is already set (from backend), use it
  const portalStatus = (lead as any).portal_status;
  if (portalStatus) {
    // Ensure it's a valid portal status value
    const validStatuses: PortalStatus[] = ['not_invited', 'invited', 'active', 'disabled'];
    if (validStatuses.includes(portalStatus as PortalStatus)) {
      return portalStatus as PortalStatus;
    }
  }

  // Default to 'not_invited' if not set
  return 'not_invited';
}

/**
 * Checks if a client is eligible for portal invitation.
 * Eligibility requires: contract signed AND payment succeeded
 * This is separate from portal_status (which reflects invitation state)
 * 
 * Priority:
 * 1. Backend-computed `is_eligible` field (preferred - server-side computation)
 * 2. Explicit eligibility flags (`portal_eligible`, `is_portal_eligible`)
 * 3. Client-side computation from contract/payment data (fallback)
 */
export function isPortalEligible(lead: User): boolean {
  const leadAny = lead as any;
  const leadId = leadAny.id || leadAny.email || 'unknown';
  
  // Priority 1: Use backend-computed is_eligible field (server-side computation)
  if (leadAny.is_eligible === true) {
    console.log(`✅ [Portal Eligibility] ${leadId}: Eligible via backend is_eligible field`);
    return true;
  }
  if (leadAny.is_eligible === false) {
    console.log(`❌ [Portal Eligibility] ${leadId}: Not eligible via backend is_eligible field`);
    return false;
  }
  
  // Priority 2: Check if backend provides explicit eligibility flag
  if (leadAny.portal_eligible === true || leadAny.is_portal_eligible === true) {
    console.log(`✅ [Portal Eligibility] ${leadId}: Eligible via explicit flag`);
    return true;
  }

  // Check contract status - look for contracts array or contract_status field
  let hasSignedContract = false;
  
  if (leadAny.contracts && Array.isArray(leadAny.contracts)) {
    console.log(`🔍 [Portal Eligibility] ${leadId}: Found contracts array with ${leadAny.contracts.length} contracts`);
    // Check if any contract has status 'signed'
    hasSignedContract = leadAny.contracts.some(
      (contract: any) => {
        const isSigned = contract.status === 'signed' || 
                        contract.contract_status === 'signed' ||
                        contract.signed === true;
        if (isSigned) {
          console.log(`✅ [Portal Eligibility] ${leadId}: Found signed contract:`, contract);
        }
        return isSigned;
      }
    );
  } else if (leadAny.contract_status === 'signed' || leadAny.has_signed_contract === true) {
    hasSignedContract = true;
    console.log(`✅ [Portal Eligibility] ${leadId}: Contract signed via contract_status/has_signed_contract`);
  } else {
    console.log(`❌ [Portal Eligibility] ${leadId}: No signed contract found. Available fields:`, {
      hasContracts: !!leadAny.contracts,
      contractsType: typeof leadAny.contracts,
      contract_status: leadAny.contract_status,
      has_signed_contract: leadAny.has_signed_contract,
      contract_signed: leadAny.contract_signed,
      allKeys: Object.keys(leadAny).filter(k => k.toLowerCase().includes('contract'))
    });
  }

  // Check payment status - look for payments array or payment_status field
  let hasSucceededPayment = false;
  
  if (leadAny.payments && Array.isArray(leadAny.payments)) {
    console.log(`🔍 [Portal Eligibility] ${leadId}: Found payments array with ${leadAny.payments.length} payments`);
    // Check if any payment has status 'succeeded'
    hasSucceededPayment = leadAny.payments.some(
      (payment: any) => {
        const isSucceeded = payment.status === 'succeeded' || 
                           payment.payment_status === 'succeeded' ||
                           payment.status === 'completed';
        if (isSucceeded) {
          console.log(`✅ [Portal Eligibility] ${leadId}: Found succeeded payment:`, payment);
        }
        return isSucceeded;
      }
    );
  } else if (leadAny.payment_status === 'succeeded' || leadAny.has_completed_payment === true) {
    hasSucceededPayment = true;
    console.log(`✅ [Portal Eligibility] ${leadId}: Payment succeeded via payment_status/has_completed_payment`);
  } else {
    console.log(`❌ [Portal Eligibility] ${leadId}: No succeeded payment found. Available fields:`, {
      hasPayments: !!leadAny.payments,
      paymentsType: typeof leadAny.payments,
      payment_status: leadAny.payment_status,
      has_completed_payment: leadAny.has_completed_payment,
      payment_succeeded: leadAny.payment_succeeded,
      allKeys: Object.keys(leadAny).filter(k => k.toLowerCase().includes('payment'))
    });
  }

  // Check for combined eligibility indicators
  if (leadAny.contract_signed === true && leadAny.payment_succeeded === true) {
    console.log(`✅ [Portal Eligibility] ${leadId}: Eligible via contract_signed + payment_succeeded flags`);
    return true;
  }

  // Client is eligible only if BOTH contract signed AND payment succeeded
  const eligible = hasSignedContract && hasSucceededPayment;
  console.log(`📊 [Portal Eligibility] ${leadId}: Final result = ${eligible} (contract: ${hasSignedContract}, payment: ${hasSucceededPayment})`);
  return eligible;
}

