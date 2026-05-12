import { ClienteDemanda, DemandaClienteStatus } from '@/types/demandasCentral';

export type StatusRuleConfig = {
  requiredDates: Array<keyof Pick<ClienteDemanda, 'prazoEntrega' | 'dataRelatorio' | 'dataOtimizacao' | 'ultimaMensagem'>>;
  requiredFieldsToEnter?: Array<keyof Pick<ClienteDemanda, 'urlDashboard' | 'urlGoogleAds' | 'urlMetaAds' | 'dataRelatorio' | 'dataOtimizacao'>>;
  requireAtLeastOne?: Array<Array<keyof ClienteDemanda>>;
};

export const STATUS_RULES: Record<DemandaClienteStatus, StatusRuleConfig> = {
  'A fazer': { requiredDates: ['prazoEntrega'] },
  'Em andamento': { requiredDates: ['prazoEntrega'] },
  'Aguardando cliente': { requiredDates: ['ultimaMensagem'] },
  'Aguardando pagamento': { requiredDates: ['ultimaMensagem'] },
  Feito: {
    requiredDates: ['dataRelatorio', 'dataOtimizacao'],
    requiredFieldsToEnter: ['urlDashboard', 'dataRelatorio', 'dataOtimizacao'],
    requireAtLeastOne: [['urlGoogleAds', 'urlMetaAds']],
  },
  Recorrente: { requiredDates: ['dataOtimizacao'] },
  Pausado: { requiredDates: [] },
  Cancelado: { requiredDates: [] },
};

export function canTransitionToStatus(item: ClienteDemanda, target: DemandaClienteStatus): { ok: boolean; reason?: string } {
  const rule = STATUS_RULES[target];
  if (!rule) return { ok: true };

  if (rule.requiredFieldsToEnter) {
    for (const field of rule.requiredFieldsToEnter) {
      if (!item[field]) {
        return { ok: false, reason: `Campo obrigatorio para "${target}": ${String(field)}` };
      }
    }
  }

  if (rule.requireAtLeastOne) {
    for (const group of rule.requireAtLeastOne) {
      const hasAny = group.some((field) => Boolean(item[field]));
      if (!hasAny) {
        return { ok: false, reason: `Preencha ao menos um: ${group.join(' ou ')}` };
      }
    }
  }

  return { ok: true };
}
