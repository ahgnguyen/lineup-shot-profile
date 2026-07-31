// frontend/src/components/LineupSelector.tsx

import { useEffect, useState } from "react";
import { getTeamPlayers, getTeams, type Team, type TeamPlayer } from "../api/teams";
import { getTeamLineups, type TeamLineup } from "../api/lineups";

export interface LineupSlot {
  id: number;
  name: string;
  teamId: number;
  teamAbbreviation: string;
}

export type LineupSlots = (LineupSlot | null)[];

export const EMPTY_LINEUP: LineupSlots = [null, null, null, null, null];

function teamLogoUrl(teamId: number): string {
  return `/logos/${teamId}.svg`;
}

function useLineupSlots(slots: LineupSlots, onSlotsChange: (slots: LineupSlots) => void) {
  const [activeSlot, setActiveSlot] = useState<number | null>(0);

  function firstEmptySlot(current: LineupSlots): number | null {
    const index = current.findIndex((slot) => slot === null);
    return index === -1 ? null : index;
  }

  function handleSelectSlot(index: number) {
    setActiveSlot(index === activeSlot ? null : index);
  }

  function handleRemoveSlot(index: number, event: React.MouseEvent) {
    event.stopPropagation();
    const next = [...slots];
    next[index] = null;
    onSlotsChange(next);
    setActiveSlot(index);
  }

  function handleClearAll() {
    onSlotsChange(EMPTY_LINEUP);
    setActiveSlot(0);
  }

  function placePlayer(player: LineupSlot) {
    const targetIndex = activeSlot ?? firstEmptySlot(slots);
    if (targetIndex === null) return;

    const next = [...slots];
    next[targetIndex] = player;
    onSlotsChange(next);
    setActiveSlot(firstEmptySlot(next));
  }

  function placeLineup(lineup: TeamLineup) {
    const next: LineupSlots = lineup.playerIds.map((playerId, index) => ({
      id: playerId,
      name: lineup.playerNames[index],
      teamId: lineup.playerTeamIds[index],
      teamAbbreviation: lineup.playerTeamAbbreviations[index],
    }));
    onSlotsChange(next);
    setActiveSlot(null);
  }

  const selectedPlayerIds = new Set(slots.filter((s): s is LineupSlot => s !== null).map((s) => s.id));

  return {
    activeSlot,
    handleSelectSlot,
    handleRemoveSlot,
    handleClearAll,
    placePlayer,
    placeLineup,
    selectedPlayerIds,
    hasAnyPlayers: selectedPlayerIds.size > 0,
  };
}

export type LineupSlotsController = ReturnType<typeof useLineupSlots>;

export function useLineupController(
  slots: LineupSlots,
  onSlotsChange: (slots: LineupSlots) => void,
): LineupSlotsController {
  return useLineupSlots(slots, onSlotsChange);
}

interface LineupSlotsPanelProps {
  slots: LineupSlots;
  controller: LineupSlotsController;
  weightsByPlayer?: Map<number, number>;
}

export function LineupSlotsPanel({ slots, controller, weightsByPlayer }: LineupSlotsPanelProps) {
  const { activeSlot, handleSelectSlot, handleRemoveSlot, handleClearAll, hasAnyPlayers } = controller;

  return (
    <div className="lineup-slots-column">
      <div className="lineup-slots-header">
        <div className="lineup-slots-title">Lineup</div>
        <button className="lineup-clear-all" disabled={!hasAnyPlayers} onClick={handleClearAll}>
          Clear all
        </button>
      </div>

      <div className="lineup-slots">
        {slots.map((slot, index) => {
          const weight = slot ? weightsByPlayer?.get(slot.id) : undefined;

          return (
            <div
              key={index}
              className={`lineup-slot${slot ? " filled" : ""}${activeSlot === index ? " active" : ""}`}
              onClick={() => handleSelectSlot(index)}
            >
              {slot ? (
                <>
                  <img className="lineup-slot-logo" src={teamLogoUrl(slot.teamId)} alt="" />
                  <div className="lineup-slot-text">
                    <span className="lineup-slot-name">{slot.name}</span>
                    <span className="lineup-slot-team">
                      {slot.teamAbbreviation}
                      {weight !== undefined && <> &middot; {(weight * 100).toFixed(0)}% of FGA</>}
                    </span>
                  </div>
                  <button className="lineup-slot-remove" onClick={(e) => handleRemoveSlot(index, e)}>
                    ×
                  </button>
                </>
              ) : (
                <span className="lineup-slot-placeholder">+ Add player</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface LineupPickerProps {
  controller: LineupSlotsController;
}

export function LineupPicker({ controller }: LineupPickerProps) {
  const { placePlayer, placeLineup, selectedPlayerIds } = controller;

  const [teams, setTeams] = useState<Team[]>([]);
  const [teamsError, setTeamsError] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [roster, setRoster] = useState<TeamPlayer[]>([]);
  const [teamLineups, setTeamLineups] = useState<TeamLineup[]>([]);
  const [rosterError, setRosterError] = useState(false);
  const [pickerTab, setPickerTab] = useState<"players" | "lineups">("players");

  useEffect(() => {
    getTeams()
      .then(setTeams)
      .catch(() => setTeamsError(true));
  }, []);

  useEffect(() => {
    if (selectedTeamId === null) {
      setRoster([]);
      setTeamLineups([]);
      setRosterError(false);
      return;
    }
    let cancelled = false;
    setRosterError(false);
    Promise.all([getTeamPlayers(selectedTeamId), getTeamLineups(selectedTeamId)])
      .then(([players, lineups]) => {
        if (cancelled) return;
        setRoster(players);
        setTeamLineups(lineups);
      })
      .catch(() => {
        if (cancelled) return;
        setRoster([]);
        setTeamLineups([]);
        setRosterError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedTeamId]);

  function handlePickFromRoster(player: TeamPlayer, team: Team) {
    placePlayer({ id: player.id, name: player.name, teamId: team.id, teamAbbreviation: team.abbreviation });
  }

  const selectedTeam = teams.find((team) => team.id === selectedTeamId) ?? null;
  const qualifyingLineups = teamLineups.filter((l) => l.sufficientSample);

  function isLineupSelected(lineup: TeamLineup): boolean {
    return (
      lineup.playerIds.length === selectedPlayerIds.size &&
      lineup.playerIds.every((id) => selectedPlayerIds.has(id))
    );
  }

  useEffect(() => {
    if (pickerTab === "lineups" && qualifyingLineups.length === 0) {
      setPickerTab("players");
    }
  }, [pickerTab, qualifyingLineups.length]);

  return (
    <div className="lineup-picker">
      <div className="picker-browse">
        {teamsError && (
          <div className="fetch-error">Couldn't load teams. Check your connection and reload the page.</div>
        )}
        <div className="team-logo-grid">
          {teams.map((team) => (
            <button
              key={team.id}
              className={`team-logo-button${team.id === selectedTeamId ? " active" : ""}`}
              title={team.name}
              aria-label={team.name}
              aria-pressed={team.id === selectedTeamId}
              onClick={() => setSelectedTeamId(team.id)}
            >
              <img className="team-logo" src={teamLogoUrl(team.id)} alt="" />
            </button>
          ))}
        </div>

        {selectedTeam ? (
          <>
            <div className="picker-team-header">
              <div className="picker-team-name">{selectedTeam.name}</div>

              <div className="picker-tab-toggle">
                <button
                  className={pickerTab === "players" ? "active" : ""}
                  onClick={() => setPickerTab("players")}
                >
                  Players
                </button>
                <button
                  className={pickerTab === "lineups" ? "active" : ""}
                  disabled={qualifyingLineups.length === 0}
                  onClick={() => setPickerTab("lineups")}
                >
                  Real Lineups
                </button>
              </div>
            </div>

            {rosterError && (
              <div className="fetch-error">Couldn't load this team's roster. Try again in a moment.</div>
            )}

            {rosterError ? null : pickerTab === "players" ? (
              <ul className="lineup-roster two-column">
                {roster.map((player) => (
                  <li key={player.id}>
                    <button
                      disabled={selectedPlayerIds.has(player.id)}
                      onClick={() => handlePickFromRoster(player, selectedTeam)}
                    >
                      {player.name}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <ul className="real-lineup-list">
                {qualifyingLineups.map((lineup) => (
                  <li key={lineup.id}>
                    <button disabled={isLineupSelected(lineup)} onClick={() => placeLineup(lineup)}>
                      <span className="real-lineup-players">{lineup.playerNames.join(" · ")}</span>
                      <span className="real-lineup-meta">{lineup.totalFga} FGA</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </>
        ) : (
          <div className="picker-label">Pick a team to see its roster</div>
        )}
      </div>
    </div>
  );
}
