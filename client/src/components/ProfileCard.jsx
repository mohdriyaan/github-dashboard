const ProfileCard = ({ profile }) => {
  return (
    <div>
      <h2>Profile</h2>
      
      <img src={profile?.avatar_url} alt={`${profile?.login} avatar`} />

      <p>Name: {profile?.name}</p>
      <p>Username: {profile?.login}</p>
      <p>Bio: {profile?.bio || "No Bio"}</p>
      <p>Location: {profile?.location || "Location not specified"}</p>
      <p>Followers: {profile?.followers}</p>
      <p>Public Repos: {profile?.public_repos}</p>

      <p>
        GitHub profile link: 
        <a 
          href={profile?.html_url} 
          target="_blank" 
          rel="noreferrer"
        >
          {profile?.login}
        </a>
      </p>
    </div>
  )
}
export default ProfileCard