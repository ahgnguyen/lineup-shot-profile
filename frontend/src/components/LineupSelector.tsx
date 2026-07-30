// frontend/src/components/LineupSelector.tsx

import { useEffect, useState } from "react";
import { getTeamPlayers, getTeams, type Team, type TeamPlayer } from "../api/teams";
import { searchPlayers, type PlayerSearchResult } from "../api/players";
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
      <div className="lineup-slots-title">Lineup</div>

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

      <button className="lineup-clear-all" disabled={!hasAnyPlayers} onClick={handleClearAll}>
        Clear all
      </button>
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
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<PlayerSearchResult[]>([]);

  useEffect(() => {
    getTeams()
      .then(setTeams)
      .catch(() => setTeamsError(true));
  }, []);

  useEffect(() => {
    if (selectedTeamId === null) {
      setRoster([]);
      setTeamLineups([]);
      return;
    }
    getTeamPlayers(selectedTeamId).then(setRoster);
    getTeamLineups(selectedTeamId).then(setTeamLineups);
  }, [selectedTeamId]);

  useEffect(() => {
    const query = searchQuery.trim();
    if (!query) {
      setSearchResults([]);
      return;
    }
    const timeout = setTimeout(() => {
      searchPlayers(query).then(setSearchResults);
    }, 200);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  function handlePickFromRoster(player: TeamPlayer, team: Team) {
    placePlayer({ id: player.id, name: player.name, teamId: team.id, teamAbbreviation: team.abbreviation });
  }

  function handlePickFromSearch(result: PlayerSearchResult) {
    placePlayer({
      id: result.id,
      name: result.name,
      teamId: result.team_id,
      teamAbbreviation: result.team_abbreviation,
    });
    setSearchQuery("");
  }

  const selectedTeam = teams.find((team) => team.id === selectedTeamId) ?? null;
  const isSearching = searchQuery.trim().length > 0;
  const qualifyingLineups = teamLineups.filter((l) => l.sufficientSample);

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

        <input
          type="text"
          className="lineup-search"
          placeholder="Search players by name…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        {isSearching ? (
          <ul className="lineup-roster">
            {searchResults.map((result) => (
              <li key={result.id}>
                <button disabled={selectedPlayerIds.has(result.id)} onClick={() => handlePickFromSearch(result)}>
                  {result.name} <span className="lineup-roster-team">{result.team_abbreviation}</span>
                </button>
              </li>
            ))}
          </ul>
        ) : selectedTeam ? (
          <>
            <div className="picker-label">{selectedTeam.name}</div>
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
          </>
        ) : (
          <div className="picker-label">Pick a team to see its roster</div>
        )}
      </div>

      {!isSearching && selectedTeam && qualifyingLineups.length > 0 && (
        <div className="real-lineups-section">
          <div className="real-lineups-title">Real lineups (100+ FGA)</div>
          <ul className="real-lineup-list">
            {qualifyingLineups.map((lineup) => (
              <li key={lineup.id}>
                <button onClick={() => placeLineup(lineup)}>
                  <span className="real-lineup-players">{lineup.playerNames.join(" · ")}</span>
                  <span className="real-lineup-meta">{lineup.totalFga} FGA</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
