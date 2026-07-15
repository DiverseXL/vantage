import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useAdmin } from '../contexts/AdminContext';
import { useMarkets } from '../hooks/useMarkets';
import { MarketService } from '../services/MarketService';
import { getErrorMessage } from '../lib/api';
import { fadeUp } from '../lib/motion';
import { ActionButton } from '../components/app/ActionButton';
import styles from './AdminDashboard.module.css';

export function AdminDashboard() {
  const { setAdminKey, clearAdminKey, isAdmin } = useAdmin();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: markets } = useMarkets();

  // ---- Key entry form ----
  const [keyDraft, setKeyDraft] = useState('');
  const [createDesc, setCreateDesc] = useState('');
  const [createLabel0, setCreateLabel0] = useState('');
  const [createLabel1, setCreateLabel1] = useState('');
  const [resolveMarketId, setResolveMarketId] = useState('');
  const [resolveOutcome, setResolveOutcome] = useState<0 | 1>(0);
  const [resolveConfirming, setResolveConfirming] = useState(false);

  if (!isAdmin) {
    return (
      <div className={styles.keyEntry}>
        <div className={styles.keyEntryBox}>
          <h1 className={styles.heading}>Admin access</h1>
          <p className={styles.keyEntryHint}>
            Enter the admin key to access the dashboard. This is a soft gate — the key is validated server-side on each request.
          </p>
          <form
            onSubmit={(e) => { e.preventDefault(); setAdminKey(keyDraft); }}
            className={styles.keyForm}
          >
            <input
              type="password"
              className={styles.keyInput}
              value={keyDraft}
              onChange={(e) => setKeyDraft(e.target.value)}
              placeholder="Admin key"
              aria-label="Admin key"
              autoComplete="current-password"
            />
            <button
              type="submit"
              className={`btn-pill btn-pill-dark ${styles.keyBtn}`}
              disabled={!keyDraft.trim()}
            >
              Connect as Admin
            </button>
          </form>
        </div>
      </div>
    );
  }

  const handleCreateMarket = async () => {
    if (!createDesc.trim()) return;
    try {
      const result = await toast.promise(
        MarketService.createMarket(createDesc.trim(), createLabel0 || undefined, createLabel1 || undefined),
        {
          loading: 'Creating market on-chain…',
          success: (data) => `Market created! Tx: ${data.txHash.slice(0, 10)}…`,
          error: (err) => getErrorMessage(err),
        }
      );
      await queryClient.invalidateQueries({ queryKey: ['markets'] });
      setCreateDesc('');
      setCreateLabel0('');
      setCreateLabel1('');
      // Route to new market if ID is returned (Phase 8.8)
      if (result.marketId) {
        navigate(`/market/${result.marketId}`);
      }
    } catch (err) {
      // handled by useAsyncAction / toast
      throw err;
    }
  };

  const handleResolve = async () => {
    if (!resolveMarketId) return;
    setResolveConfirming(false);
    try {
      await toast.promise(
        MarketService.resolveMarket(resolveMarketId, resolveOutcome),
        {
          loading: 'Resolving market on-chain…',
          success: (data) => `Market resolved! Tx: ${data.txHash.slice(0, 10)}…`,
          error: (err) => getErrorMessage(err),
        }
      );
      await queryClient.invalidateQueries({ queryKey: ['markets'] });
      setResolveMarketId('');
      setResolveOutcome(0);
    } catch (err) {
      throw err;
    }
  };

  const handleFinalize = async (marketId: string) => {
    try {
      await toast.promise(
        MarketService.finalizeResolution(marketId),
        {
          loading: 'Finalizing market on-chain…',
          success: (data) => `Market finalized! Tx: ${data.txHash.slice(0, 10)}…`,
          error: (err) => getErrorMessage(err),
        }
      );
      await queryClient.invalidateQueries({ queryKey: ['markets'] });
    } catch (err) {
      throw err;
    }
  };

  const unresolvedMarkets = markets?.filter((m) => !m.resolved && !m.resolutionProposed) ?? [];
  const selectedMarket = markets?.find((m) => m.id === resolveMarketId);
  const label0 = selectedMarket?.outcome0Label ?? 'Option A';
  const label1 = selectedMarket?.outcome1Label ?? 'Option B';

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.heading}>Admin Dashboard</h1>
        <button
          className={`btn-pill btn-pill-light ${styles.disconnectBtn}`}
          onClick={clearAdminKey}
        >
          Disconnect
        </button>
      </div>

      <div className={styles.grid}>
        {/* Create Market */}
        <motion.section className={styles.card} aria-labelledby="create-heading" variants={fadeUp} initial="initial" animate="animate">
          <h2 id="create-heading" className={styles.cardTitle}>Create market</h2>
          <div className={styles.form}>
            <div className={styles.field}>
              <label htmlFor="market-desc" className={styles.label}>
                Market question <span className={styles.required}>*</span>
              </label>
              <textarea
                id="market-desc"
                className={styles.textarea}
                value={createDesc}
                onChange={(e) => setCreateDesc(e.target.value)}
                placeholder="Will Team A win the championship?"
                rows={3}
                required
                minLength={10}
              />
            </div>
            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <label htmlFor="label-0" className={styles.label}>Option A label</label>
                <input
                  id="label-0"
                  type="text"
                  className={styles.input}
                  value={createLabel0}
                  onChange={(e) => setCreateLabel0(e.target.value)}
                  placeholder="Yes"
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="label-1" className={styles.label}>Option B label</label>
                <input
                  id="label-1"
                  type="text"
                  className={styles.input}
                  value={createLabel1}
                  onChange={(e) => setCreateLabel1(e.target.value)}
                  placeholder="No"
                />
              </div>
            </div>
            <ActionButton
              onClick={handleCreateMarket}
              pendingLabel="Creating…"
              className={`btn-pill btn-pill-dark ${styles.actionBtn}`}
              disabled={!createDesc.trim()}
            >
              Create market
            </ActionButton>
          </div>
        </motion.section>

        {/* Resolve Market */}
        <motion.section className={styles.card} aria-labelledby="resolve-heading" variants={fadeUp} initial="initial" animate="animate">
          <h2 id="resolve-heading" className={styles.cardTitle}>Resolve market</h2>
          <div className={styles.form}>
            <div className={styles.field}>
              <label htmlFor="resolve-market" className={styles.label}>Select market</label>
              <select
                id="resolve-market"
                className={styles.select}
                value={resolveMarketId}
                onChange={(e) => setResolveMarketId(e.target.value)}
              >
                <option value="">— Choose an unresolved market —</option>
                {unresolvedMarkets.map((m) => (
                  <option key={m.id} value={m.id}>
                    #{m.id} — {m.description.slice(0, 60)}{m.description.length > 60 ? '…' : ''}
                  </option>
                ))}
              </select>
              {unresolvedMarkets.length === 0 && (
                <p className={styles.hint}>No unresolved markets.</p>
              )}
            </div>

            {resolveMarketId && (
              <div className={styles.field}>
                <span className={styles.label}>Winning outcome</span>
                <div className={styles.outcomeGroup}>
                  {([0, 1] as const).map((o) => (
                    <label key={o} className={`${styles.outcomeOption} ${resolveOutcome === o ? styles.selected : ''}`}>
                      <input
                        type="radio"
                        name="resolve-outcome"
                        value={o}
                        checked={resolveOutcome === o}
                        onChange={() => setResolveOutcome(o)}
                        className={styles.radioHidden}
                      />
                      {o === 0 ? label0 : label1}
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Confirm dialog */}
            {resolveConfirming && resolveMarketId && (
              <div className={styles.confirmBox} role="alertdialog" aria-label="Confirm resolution">
                <p className={styles.confirmText}>
                  <strong>This cannot be undone on-chain.</strong> Resolve market #{resolveMarketId} as <strong>{resolveOutcome === 0 ? label0 : label1}</strong>?
                </p>
                <div className={styles.confirmBtns}>
                  <ActionButton
                    className={`btn-pill btn-pill-dark ${styles.confirmYes}`}
                    onClick={handleResolve}
                    pendingLabel="Resolving…"
                  >
                    Yes, resolve
                  </ActionButton>
                  <button
                    className={`btn-pill btn-pill-light`}
                    onClick={() => setResolveConfirming(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {!resolveConfirming && (
              <button
                className={`btn-pill btn-pill-dark ${styles.actionBtn}`}
                disabled={!resolveMarketId}
                onClick={() => setResolveConfirming(true)}
              >
                Resolve market
              </button>
            )}
          </div>
        </motion.section>
      </div>

      {/* All markets table */}
      <motion.section className={styles.tableSection} aria-labelledby="markets-table-heading" variants={fadeUp} initial="initial" animate="animate" transition={{ delay: 0.1 }}>
        <h2 id="markets-table-heading" className={styles.cardTitle}>All markets</h2>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>#</th>
                <th>Description</th>
                <th>Status</th>
                <th>Pool (INJ)</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {(markets ?? []).map((m) => {
                const total = (BigInt(m.totalPool0) + BigInt(m.totalPool1));
                const totalInj = (Number(total) / 1e18).toFixed(4);
                return (
                  <tr key={m.id}>
                    <td className={styles.idCell}>{m.id}</td>
                    <td className={styles.descCell}>{m.description}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${m.resolved ? styles.resolvedBadge : (m.resolutionProposed ? styles.proposedBadge : styles.activeBadge)}`}>
                        {m.resolved ? 'Resolved' : (m.resolutionProposed ? 'Challenge Period' : 'Active')}
                      </span>
                    </td>
                    <td className={styles.poolCell}>{totalInj}</td>
                    <td className={styles.actionsCell}>
                      <a href={`/market/${m.id}`} className={styles.viewLink}>View</a>
                      {!m.resolved && !m.resolutionProposed && (
                        <button
                          className={styles.resolveQuick}
                          onClick={() => { setResolveMarketId(m.id); setResolveConfirming(false); }}
                        >
                          Propose
                        </button>
                      )}
                      {!m.resolved && m.resolutionProposed && (
                        <ActionButton
                          className={styles.resolveQuick}
                          onClick={() => handleFinalize(m.id)}
                          pendingLabel="Finalizing…"
                        >
                          Finalize
                        </ActionButton>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.section>
    </div>
  );
}
