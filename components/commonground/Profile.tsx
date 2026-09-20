"use client";

import { Check } from "lucide-react";

type ProfileProps = {
  alias: string;
  onRegenerate: () => void;
  onErase: () => void;
};

export function Profile({ alias, onRegenerate, onErase }: ProfileProps) {
  return (
    <div className="profile">
      <p>YOUR ANONYMOUS SPACE</p>
      <div className="profile-card">
        <span className="avatar teal big">{alias[0]}</span>
        <div>
          <h1>{alias}</h1>
          <span>
            A generated pseudonym, not a legal name, diagnosis proof, or study
            ID.
          </span>
        </div>
        <button type="button" onClick={onRegenerate}>
          Generate another
        </button>
      </div>
      <div className="profile-grid">
        <section>
          <h2>Visible to the community</h2>
          <p>
            Your generated alias can provide continuity without asking you to
            disclose who you are.
          </p>
          <b>
            <Check size={15} />
            No age, location, or health profile
          </b>
        </section>
        <section>
          <h2>Control this demo</h2>
          <p>
            Posts and local themes disappear when this session ends. Your alias
            is saved in this browser only. Use erase before a live presentation
            to reset.
          </p>
          <button type="button" className="danger" onClick={onErase}>
            Erase local demo data
          </button>
        </section>
      </div>
    </div>
  );
}
