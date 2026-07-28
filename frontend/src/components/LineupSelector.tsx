// frontend/src/components/LineupSelector.tsx

import { useEffect, useState } from "react";
import { getTeamPlayers, getTeams, type Team, type TeamPlayer } from "../api/teams";
import { searchPlayers, type PlayerSearchResult } from "../api/players";

export interface LineupSlot {
  id: number;
  name: string;
  teamAbbreviation: string;
}

export type LineupSlots = (LineupSlot | null)[];

export const EMPTY_LINEUP: LineupSlots = [null, null, null, null, null];

interface LineupSelectorProps {
  slots: LineupSlots;
  onSlotsChange: (slots: LineupSlots) => void;
}

export function LineupSelector({ slots, onSlotsChange }: LineupSelectorProps) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [roster, setRoster] = useState<TeamPlayer[]>([]);
  const [activeSlot, setActiveSlot] = useState<number | null>(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<PlayerSearchResult[]>([]);

  useEffect(() => {
    getTeams().then(setTeams);
  }, []);

  useEffect(() => {
    if (selectedTeamId === null) {
      setRoster([]);
      return;
    }
    getTeamPlayers(selectedTeamId).then(setRoster);
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

  function placePlayer(player: LineupSlot) {
    const targetIndex = activeSlot ?? firstEmptySlot(slots);
    if (targetIndex === null) return;

    const next = [...slots];
    next[targetIndex] = player;
    onSlotsChange(next);
    setActiveSlot(firstEmptySlot(next));
  }

  function handlePickFromRoster(player: TeamPlayer, team: Team) {
    placePlayer({ id: player.id, name: player.name, teamAbbreviation: team.abbreviation });
  }

  function handlePickFromSearch(result: PlayerSearchResult) {
    placePlayer({ id: result.id, name: result.name, teamAbbreviation: result.team_abbreviation });
    setSearchQuery("");
  }

  const selectedTeam = teams.find((team) => team.id === selectedTeamId) ?? null;
  const selectedPlayerIds = new Set(slots.filter((s): s is LineupSlot => s !== null).map((s) => s.id));
  const isSearching = searchQuery.trim().length > 0;

  return (
    <div className="lineup-selector">
      <div className="lineup-slots">
        {slots.map((slot, index) => (
          <div
            key={index}
            className={`lineup-slot${slot ? " filled" : ""}${activeSlot === index ? " active" : ""}`}
            onClick={() => handleSelectSlot(index)}
          >
            {slot ? (
              <>
                <span className="lineup-slot-name">{slot.name}</span>
                <span className="lineup-slot-team">{slot.teamAbbreviation}</span>
                <button className="lineup-slot-remove" onClick={(e) => handleRemoveSlot(index, e)}>
                  ×
                </button>
              </>
            ) : (
              <span className="lineup-slot-placeholder">+ Add player</span>
            )}
          </div>
        ))}
      </div>

      <div className="lineup-picker">
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
                <button
                  disabled={selectedPlayerIds.has(result.id)}
                  onClick={() => handlePickFromSearch(result)}
                >
                  {result.name} <span className="lineup-roster-team">{result.team_abbreviation}</span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <>
            <select
              value={selectedTeamId ?? ""}
              onChange={(e) => setSelectedTeamId(e.target.value ? Number(e.target.value) : null)}
            >
              <option value="">Select a team…</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>

            {selectedTeam && (
              <ul className="lineup-roster">
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
            )}
          </>
        )}
      </div>
    </div>
  );
}
